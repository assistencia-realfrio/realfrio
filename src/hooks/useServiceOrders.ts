import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext"; // Importar useSession
import { format } from "date-fns";
import { ServiceOrderStatus, serviceOrderStatuses } from "@/lib/serviceOrderStatus";
import { logActivity } from "@/utils/activityLogger";
import { showError } from "@/utils/toast"; // Importar showError

export type { ServiceOrderStatus };
export { serviceOrderStatuses };

export interface ServiceOrder {
  id: string;
  display_id: string; // Novo campo para o ID formatado
  equipment: string;
  model: string | null;
  serial_number: string | null; 
  client: string;
  client_id: string;
  equipment_id: string | null; // Novo campo para referenciar o equipamento
  description: string;
  status: ServiceOrderStatus;
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS";
  created_at: string;
  updated_at: string | null; // Adicionado campo de atualização
  scheduled_date: string | null; // NOVO: Data prevista para assistência
  technician_id: string | null; // NOVO: ID do técnico atribuído
  technician_name: string | null; // NOVO: Nome do técnico (via join)
}

export type ServiceOrderFormValues = Omit<ServiceOrder, 'id' | 'created_at' | 'client' | 'display_id' | 'equipment_id' | 'updated_at' | 'technician_name'> & {
    serial_number: string | undefined;
    model: string | undefined;
    equipment_id?: string;
    scheduled_date?: string | null; // Permitir string ISO ou null
    technician_id?: string | null; // Permitir UUID ou null
};

// Alterado para usar 'profiles' diretamente, pois é o nome da tabela que contém os dados do técnico
type ServiceOrderRaw = Omit<ServiceOrder, 'client' | 'technician_name'> & {
    clients: { name: string } | { name: string }[] | null;
    profiles: { first_name: string, last_name: string } | { first_name: string, last_name: string }[] | null; // Alterado de 'technicians' para 'profiles'
};

const generateDisplayId = (store: ServiceOrder['store']): string => {
    const prefix = store === 'CALDAS DA RAINHA' ? 'CR' : 'PM';
    const dateTimePart = format(new Date(), 'dd-MM-yyyy-HHmm');
    return `${prefix}-${dateTimePart}`;
};

const fetchServiceOrders = async (userId: string | undefined, storeFilter: ServiceOrder['store'] | 'ALL' = 'ALL'): Promise<ServiceOrder[]> => {
  if (!userId) return [];
  
  let query = supabase
    .from('service_orders')
    .select(`
      id, 
      display_id,
      equipment, 
      model, 
      serial_number, 
      description, 
      status, 
      store, 
      created_at,
      updated_at,
      client_id,
      equipment_id,
      scheduled_date,
      technician_id,
      clients (name),
      profiles (first_name, last_name) // Simplificado o join para 'profiles'
    `);
    // .eq('created_by', userId); // REMOVIDO: Filtro por created_by

  if (storeFilter !== 'ALL') {
    query = query.eq('store', storeFilter);
  }

  const { data, error } = await query;

  if (error) throw error;

  const mappedData = (data as unknown as ServiceOrderRaw[]).map(order => {
    const clientName = Array.isArray(order.clients) 
        ? order.clients[0]?.name || 'Cliente Desconhecido'
        : order.clients?.name || 'Cliente Desconhecido';
        
    // Atualizado para usar 'order.profiles'
    const technicianProfile = Array.isArray(order.profiles) 
        ? order.profiles[0] 
        : order.profiles;
        
    const technicianName = technicianProfile 
        ? `${technicianProfile.first_name || ''} ${technicianProfile.last_name || ''}`.trim() || null
        : null; // Retorna null se não houver técnico

    return {
        ...order,
        id: order.id,
        display_id: order.display_id,
        client: clientName, 
        status: order.status as ServiceOrder['status'],
        store: order.store as ServiceOrder['store'],
        created_at: order.created_at,
        updated_at: order.updated_at,
        serial_number: order.serial_number,
        model: order.model,
        equipment_id: order.equipment_id,
        scheduled_date: order.scheduled_date,
        technician_id: order.technician_id,
        technician_name: technicianName,
    };
  }) as ServiceOrder[];

  const statusOrder = new Map(serviceOrderStatuses.map((status, index) => [status, index]));

  mappedData.sort((a, b) => {
    const orderA = statusOrder.get(a.status) ?? 99;
    const orderB = statusOrder.get(b.status) ?? 99;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    const dateA = new Date(a.updated_at || a.created_at).getTime();
    const dateB = new Date(b.updated_at || b.created_at).getTime();
    
    return dateB - dateA;
  });

  return mappedData;
};

export const useServiceOrders = (id?: string, storeFilter: ServiceOrder['store'] | 'ALL' = 'ALL') => { // Adicionado storeFilter
  const { user, session } = useSession(); // Obter o objeto session
  const queryClient = useQueryClient();

  const queryKey = id ? ['serviceOrders', id, storeFilter] : ['serviceOrders', storeFilter]; // Adicionado storeFilter ao queryKey

  const { data: orders, isLoading } = useQuery<ServiceOrder[], Error>({
    queryKey: queryKey,
    queryFn: () => fetchServiceOrders(user?.id, storeFilter), // Passando storeFilter
    enabled: !!user?.id,
    select: (data) => {
      if (id) {
        const singleOrder = data.find(order => order.id === id);
        return singleOrder ? [singleOrder] : [];
      }
      return data;
    }
  });

  const order = id ? orders?.[0] : undefined;

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: ServiceOrderFormValues) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      
      const displayId = generateDisplayId(orderData.store);
      
      const { data, error } = await supabase
        .from('service_orders')
        .insert({
          equipment: orderData.equipment,
          model: orderData.model || null,
          serial_number: orderData.serial_number || null,
          description: orderData.description,
          status: orderData.status,
          store: orderData.store,
          client_id: orderData.client_id,
          equipment_id: orderData.equipment_id || null,
          display_id: displayId,
          created_by: user.id,
          scheduled_date: orderData.scheduled_date || null, // NOVO
          technician_id: orderData.technician_id || null, // NOVO
        })
        .select()
        .single();

      if (error) throw error;
      return data as ServiceOrder;
    },
    onSuccess: (newOrder) => {
      logActivity(user, {
        entity_type: 'service_order',
        entity_id: newOrder.id,
        action_type: 'created',
        content: `Ordem de Serviço "${newOrder.display_id}" foi criada.`,
        details: {
          status: { newValue: newOrder.status },
          description: { newValue: newOrder.description },
          store: { newValue: newOrder.store },
          equipment: { newValue: newOrder.equipment },
          scheduled_date: { newValue: newOrder.scheduled_date }, // NOVO
          technician_id: { newValue: newOrder.technician_id }, // NOVO
        }
      });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, ...orderData }: ServiceOrderFormValues & { id: string }) => {
      // Tenta obter o estado antigo da ordem diretamente da base de dados para comparação precisa
      const { data: oldOrder, error: fetchError } = await supabase
        .from('service_orders')
        .select('status, description, equipment, model, serial_number, store, scheduled_date, technician_id') // Adicionado scheduled_date e technician_id
        .eq('id', id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Erro ao buscar estado antigo da OS:", fetchError);
      }
      
      const { data, error } = await supabase
        .from('service_orders')
        .update({
          equipment: orderData.equipment,
          model: orderData.model || null,
          serial_number: orderData.serial_number || null,
          description: orderData.description,
          status: orderData.status,
          store: orderData.store,
          client_id: orderData.client_id,
          equipment_id: orderData.equipment_id || null,
          updated_at: new Date().toISOString(),
          scheduled_date: orderData.scheduled_date || null, // NOVO
          technician_id: orderData.technician_id || null, // NOVO
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedOrder = data as ServiceOrder;

      return { updatedOrder: updatedOrder, oldOrder: oldOrder as typeof oldOrder | null };
    },
    onSuccess: ({ updatedOrder, oldOrder }) => {
      let logContent = `OS "${updatedOrder.display_id}" foi atualizada.`;
      let actionType: 'updated' | 'status_changed' = 'updated';
      const activityDetails: Record<string, { oldValue: any; newValue: any }> = {};

      if (oldOrder) {
        const changesSummary: string[] = [];
        if (updatedOrder.status !== oldOrder.status) {
          actionType = 'status_changed';
          changesSummary.push(`o estado de "${oldOrder.status}" para "${updatedOrder.status}"`);
          activityDetails.status = { oldValue: oldOrder.status, newValue: updatedOrder.status };
        }
        if (updatedOrder.description !== oldOrder.description) {
          changesSummary.push('a descrição');
          activityDetails.description = { oldValue: oldOrder.description, newValue: updatedOrder.description };
        }
        if (updatedOrder.equipment !== oldOrder.equipment) {
          changesSummary.push('o equipamento');
          activityDetails.equipment = { oldValue: oldOrder.equipment, newValue: updatedOrder.equipment };
        }
        if (updatedOrder.model !== oldOrder.model) {
          changesSummary.push('o modelo');
          activityDetails.model = { oldValue: oldOrder.model, newValue: updatedOrder.model };
        }
        if (updatedOrder.serial_number !== oldOrder.serial_number) {
          changesSummary.push('o número de série');
          activityDetails.serial_number = { oldValue: oldOrder.serial_number, newValue: updatedOrder.serial_number };
        }
        if (updatedOrder.store !== oldOrder.store) {
          changesSummary.push('a loja');
          activityDetails.store = { oldValue: oldOrder.store, newValue: updatedOrder.store };
        }
        
        // NOVO: Log de agendamento
        if (updatedOrder.scheduled_date !== oldOrder.scheduled_date) {
            changesSummary.push('a data agendada');
            activityDetails.scheduled_date = { oldValue: oldOrder.scheduled_date, newValue: updatedOrder.scheduled_date };
        }
        if (updatedOrder.technician_id !== oldOrder.technician_id) {
            changesSummary.push('o técnico atribuído');
            activityDetails.technician_id = { oldValue: oldOrder.technician_id, newValue: updatedOrder.technician_id };
        }
        
        if (changesSummary.length > 0) {
          const firstChange = changesSummary[0].charAt(0).toUpperCase() + changesSummary[0].slice(1);
          const restOfChanges = changesSummary.slice(1);
          logContent = `Na OS "${updatedOrder.display_id}", ${firstChange}${restOfChanges.length > 0 ? ' e ' + restOfChanges.join(', ') : ''}.`;
        } else {
            logContent = `OS "${updatedOrder.display_id}" foi atualizada (sem alterações visíveis).`;
            actionType = 'updated';
        }
      }

      logActivity(user, {
        entity_type: 'service_order',
        entity_id: updatedOrder.id,
        action_type: actionType,
        content: logContent,
        details: Object.keys(activityDetails).length > 0 ? activityDetails : undefined, // Only add details if there are actual changes
      });
      
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders', id] });
    },
  });
  
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const orders = queryClient.getQueryData<ServiceOrder[]>(['serviceOrders']);
      const orderToDelete = orders?.find(o => o.id === orderId);

      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      return { orderToDelete };
    },
    onSuccess: ({ orderToDelete }) => {
      if (orderToDelete) {
        logActivity(user, {
          entity_type: 'service_order',
          entity_id: orderToDelete.id,
          action_type: 'deleted',
          content: `OS "${orderToDelete.display_id}" foi excluída.`,
          details: {
            name: { oldValue: orderToDelete.display_id, newValue: 'Excluído' }
          }
        });
      }
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
    },
  });

  return {
    orders: orders || [],
    order,
    isLoading,
    createOrder: createOrderMutation,
    updateOrder: updateOrderMutation,
    deleteOrder: deleteOrderMutation,
  };
};