import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale"; // Importação adicionada
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
  establishment_name: string | null; // Campo para nome do estabelecimento
  establishment_id: string | null; // Campo para ID do estabelecimento
  notes_count: number;
  attachments_count: number;
}

// NOVO: Tipo para o payload da mutação (insert/update)
export interface ServiceOrderMutationPayload {
  client_id: string;
  description: string;
  status: ServiceOrderStatus;
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS";
  equipment: string;
  model: string | null;
  serial_number: string | null;
  equipment_id: string | null;
  establishment_id: string | null;
  establishment_name: string | null;
  scheduled_date: string | null; // Supabase espera ISO string
  updated_at?: string; // Apenas para update, não insert
}

type ServiceOrderRaw = Omit<ServiceOrder, 'client' | 'notes_count' | 'attachments_count'> & {
    clients: { name: string } | { name: string }[] | null;
    service_order_notes: { count: number }[];
    order_attachments_metadata: { count: number }[];
};

const generateDisplayId = (store: ServiceOrder['store']): string => {
    const prefix = store === 'CALDAS DA RAINHA' ? 'CR' : 'PM';
    const dateTimePart = format(new Date(), 'dd-MM-yyyy-HHmm');
    return `${prefix}-${dateTimePart}`;
};

const fetchServiceOrders = async (userId: string | undefined, storeFilter: ServiceOrder['store'] | 'ALL' = 'ALL', statusFilter: ServiceOrderStatus | 'ALL' = 'ALL'): Promise<ServiceOrder[]> => {
  let query = supabase
    .from('service_orders')
    .select(`
      *,
      clients (name),
      service_order_notes(count),
      order_attachments_metadata(count)
    `);

  if (storeFilter !== 'ALL') {
    query = query.eq('store', storeFilter);
  }

  if (statusFilter !== 'ALL') {
    query = query.eq('status', statusFilter);
  }
  
  query = query.order('updated_at', { ascending: false, nullsFirst: false });

  const { data, error } = await query;

  if (error) {
    console.error("[useServiceOrders] Error fetching service orders:", error);
    throw error;
  }

  const mappedData = (data as unknown as ServiceOrderRaw[]).map(order => {
    const clientName = Array.isArray(order.clients) 
        ? order.clients[0]?.name || 'Cliente Desconhecido'
        : order.clients?.name || 'Cliente Desconhecido';

    const notesCount = order.service_order_notes?.[0]?.count || 0;
    const attachmentsCount = order.order_attachments_metadata?.[0]?.count || 0;

    return {
        ...order,
        client: clientName, 
        notes_count: notesCount,
        attachments_count: attachmentsCount,
    };
  }) as ServiceOrder[];

  const statusOrder = new Map(serviceOrderStatuses.map((status, index) => [status, index]));

  mappedData.sort((a, b) => {
    const orderA = statusOrder.get(a.status) ?? 99;
    const orderB = statusOrder.get(b.status) ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    const dateA = new Date(a.updated_at || a.created_at).getTime();
    const dateB = new Date(b.updated_at || b.created_at).getTime();
    return dateB - dateA;
  });

  return mappedData;
};

export const useServiceOrders = (id?: string, storeFilter: ServiceOrder['store'] | 'ALL' = 'ALL', statusFilter: ServiceOrderStatus | 'ALL' = 'ALL') => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const queryKey = ['serviceOrders', storeFilter, statusFilter, id || 'all'];

  const { data: orders, isLoading } = useQuery<ServiceOrder[], Error>({
    queryKey: queryKey,
    queryFn: () => fetchServiceOrders(user?.id, storeFilter, statusFilter),
    enabled: !!user?.id,
    select: (data) => id ? data.filter(order => order.id === id) : data,
  });

  const order = id ? orders?.[0] : undefined;

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: ServiceOrderMutationPayload) => { // Usando o novo tipo
      if (!user?.id) throw new Error("Usuário não autenticado.");
      
      const displayId = generateDisplayId(orderData.store);
      
      const { data, error } = await supabase
        .from('service_orders')
        .insert({
          ...orderData,
          display_id: displayId,
          created_by: user.id,
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
      });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, ...orderData }: ServiceOrderMutationPayload & { id: string }) => { // Usando o novo tipo
      // Obter a ordem de serviço antiga antes da atualização
      const oldOrder = queryClient.getQueryData<ServiceOrder[]>(['serviceOrders', 'ALL', 'ALL', 'all'])?.find(o => o.id === id);
      
      // 1. Criar um payload que contenha APENAS os campos da tabela 'service_orders'
      const payloadForSupabase: ServiceOrderMutationPayload = { // Explicitamente tipado
          client_id: orderData.client_id,
          description: orderData.description,
          status: orderData.status,
          store: orderData.store,
          equipment: orderData.equipment,
          model: orderData.model, // Já é string | null
          serial_number: orderData.serial_number, // Já é string | null
          equipment_id: orderData.equipment_id, // Já é string | null
          establishment_id: orderData.establishment_id, // Já é string | null
          establishment_name: orderData.establishment_name, // Já é string | null
          scheduled_date: orderData.scheduled_date, // Já é string | null
          updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('service_orders')
        .update(payloadForSupabase) // Usar o payload filtrado
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("[Supabase Error] Failed to update service order:", error);
        throw error;
      }
      return { updatedOrder: data as ServiceOrder, oldOrder };
    },
    onSuccess: ({ updatedOrder, oldOrder }) => {
      const changes: Record<string, { oldValue?: any; newValue?: any }> = {};

      // Comparar e registrar alterações
      if (oldOrder?.description !== updatedOrder.description) {
        changes.description = { oldValue: oldOrder?.description, newValue: updatedOrder.description };
      }
      if (oldOrder?.status !== updatedOrder.status) {
        changes.status = { oldValue: oldOrder?.status, newValue: updatedOrder.status };
      }
      if (oldOrder?.store !== updatedOrder.store) {
        changes.store = { oldValue: oldOrder?.store, newValue: updatedOrder.store };
      }
      if (oldOrder?.equipment !== updatedOrder.equipment) {
        changes.equipment = { oldValue: oldOrder?.equipment, newValue: updatedOrder.equipment };
      }
      if (oldOrder?.model !== updatedOrder.model) {
        changes.model = { oldValue: oldOrder?.model, newValue: updatedOrder.model };
      }
      if (oldOrder?.serial_number !== updatedOrder.serial_number) {
        changes.serial_number = { oldValue: oldOrder?.serial_number, newValue: updatedOrder.serial_number };
      }
      if (oldOrder?.equipment_id !== updatedOrder.equipment_id) {
        changes.equipment_id = { oldValue: oldOrder?.equipment_id, newValue: updatedOrder.equipment_id };
      }
      if (oldOrder?.establishment_id !== updatedOrder.establishment_id) {
        changes.establishment_id = { oldValue: oldOrder?.establishment_id, newValue: updatedOrder.establishment_id };
      }
      if (oldOrder?.establishment_name !== updatedOrder.establishment_name) {
        changes.establishment_name = { oldValue: oldOrder?.establishment_name, newValue: updatedOrder.establishment_name };
      }
      
      // Formatar datas para exibição no log
      const oldScheduledDate = oldOrder?.scheduled_date ? format(new Date(oldOrder.scheduled_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : null;
      const newScheduledDate = updatedOrder.scheduled_date ? format(new Date(updatedOrder.scheduled_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : null;

      if (oldScheduledDate !== newScheduledDate) {
        changes.scheduled_date = { oldValue: oldScheduledDate, newValue: newScheduledDate };
      }

      logActivity(user, {
        entity_type: 'service_order',
        entity_id: updatedOrder.id,
        action_type: 'updated',
        content: `OS "${updatedOrder.display_id}" foi atualizada.`,
        details: changes, // Passar os detalhes das alterações
      });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] }); // Invalida atividades para atualizar
      queryClient.invalidateQueries({ queryKey: ['vacations'] }); // Invalida férias para atualizar o calendário
    },
  });
  
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const orders = queryClient.getQueryData<ServiceOrder[]>(['serviceOrders']);
      const orderToDelete = orders?.find(o => o.id === orderId);
      
      const { error } = await supabase.from('service_orders').delete().eq('id', orderId);
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
        });
      }
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] }); // Invalida atividades para atualizar
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