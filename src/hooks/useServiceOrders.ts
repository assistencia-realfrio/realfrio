import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { format } from "date-fns";
import { ServiceOrderStatus, serviceOrderStatuses } from "@/lib/serviceOrderStatus";
import { logActivity } from "@/utils/activityLogger";
import { showError } from "@/utils/toast";

export type { ServiceOrderStatus };
export { serviceOrderStatuses };

export interface ServiceOrder {
  id: string;
  display_id: string;
  equipment: string;
  model: string | null;
  serial_number: string | null; 
  client: string;
  client_id: string;
  equipment_id: string | null;
  description: string;
  status: ServiceOrderStatus;
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS";
  created_at: string;
  updated_at: string | null;
  scheduled_date: string | null;
  technician_id: string | null; // NOVO: ID do técnico
  technician_name: string | null; // NOVO: Nome do técnico
}

export type ServiceOrderFormValues = Omit<ServiceOrder, 'id' | 'created_at' | 'client' | 'display_id' | 'equipment_id' | 'updated_at' | 'scheduled_date' | 'technician_name' | 'technician_id'> & {
    serial_number: string | undefined;
    model: string | undefined;
    equipment_id?: string;
    scheduled_date?: Date | null;
    technician_id?: string | null; // NOVO: ID do técnico para o formulário
};

type ServiceOrderRaw = Omit<ServiceOrder, 'client' | 'technician_name'> & {
    clients: { name: string } | { name: string }[] | null;
    technicians: { first_name: string, last_name: string } | null; // Assumindo que 'technicians' é o alias para profiles
};

const generateDisplayId = (store: ServiceOrder['store']): string => {
    const prefix = store === 'CALDAS DA RAINHA' ? 'CR' : 'PM';
    const dateTimePart = format(new Date(), 'dd-MM-yyyy-HHmm');
    return `${prefix}-${dateTimePart}`;
};

const fetchServiceOrders = async (userId: string | undefined, storeFilter: ServiceOrder['store'] | 'ALL' = 'ALL'): Promise<ServiceOrder[]> => {
  if (!userId) {
    return [];
  }
  
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
      technicians:profiles!service_orders_technician_id_fkey (first_name, last_name)
    `);
    // .eq('created_by', userId); // REMOVIDO: Filtro por created_by

  if (storeFilter !== 'ALL') {
    query = query.eq('store', storeFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[useServiceOrders] Error fetching service orders:", error);
    throw error;
  }

  const mappedData = (data as unknown as ServiceOrderRaw[]).map(order => {
    const clientName = Array.isArray(order.clients) 
        ? order.clients[0]?.name || 'Cliente Desconhecido'
        : order.clients?.name || 'Cliente Desconhecido';
        
    const technicianProfile = order.technicians;
    let technicianName: string | null = null;
    if (technicianProfile) {
        const firstName = (technicianProfile as { first_name: string, last_name: string }).first_name || '';
        const lastName = (technicianProfile as { first_name: string, last_name: string }).last_name || '';
        technicianName = `${firstName} ${lastName}`.trim() || null;
    }

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
        technician_name: technicianName, // NOVO: Adicionando nome do técnico
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

export const useServiceOrders = (id?: string, storeFilter: ServiceOrder['store'] | 'ALL' = 'ALL') => {
  const { user, session } = useSession();
  const queryClient = useQueryClient();

  const queryKey = id ? ['serviceOrders', id, storeFilter] : ['serviceOrders', storeFilter];

  const { data: orders, isLoading } = useQuery<ServiceOrder[], Error>({
    queryKey: queryKey,
    queryFn: () => fetchServiceOrders(user?.id, storeFilter),
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
          scheduled_date: orderData.scheduled_date ? orderData.scheduled_date.toISOString() : null,
          technician_id: orderData.technician_id || null, // NOVO: Salvando technician_id
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
          scheduled_date: { newValue: newOrder.scheduled_date ? format(new Date(newOrder.scheduled_date), 'dd/MM/yyyy') : 'N/A' },
          technician_id: { newValue: newOrder.technician_id || 'N/A' },
        }
      });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, ...orderData }: ServiceOrderFormValues & { id: string }) => {
      const { data: oldOrder, error: fetchError } = await supabase
        .from('service_orders')
        .select('status, description, equipment, model, serial_number, store, scheduled_date, technician_id') // Adicionado technician_id
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
          scheduled_date: orderData.scheduled_date ? orderData.scheduled_date.toISOString() : null,
          technician_id: orderData.technician_id || null, // NOVO: Atualizando technician_id
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
        const oldScheduledDate = oldOrder.scheduled_date ? format(new Date(oldOrder.scheduled_date), 'dd/MM/yyyy') : 'N/A';
        const newScheduledDate = updatedOrder.scheduled_date ? format(new Date(updatedOrder.scheduled_date), 'dd/MM/yyyy') : 'N/A';
        if (newScheduledDate !== oldScheduledDate) {
            changesSummary.push('a data de agendamento');
            activityDetails.scheduled_date = { oldValue: oldScheduledDate, newValue: newScheduledDate };
        }
        
        // NOVO: Log para alteração do técnico
        if (updatedOrder.technician_id !== oldOrder.technician_id) {
            const oldTechName = oldOrder.technician_id || 'N/A';
            const newTechName = updatedOrder.technician_id || 'N/A';
            changesSummary.push('o técnico atribuído');
            activityDetails.technician_id = { oldValue: oldTechName, newValue: newTechName };
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
        details: Object.keys(activityDetails).length > 0 ? activityDetails : undefined,
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