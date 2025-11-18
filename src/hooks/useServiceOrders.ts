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
  establishment_name: string | null; // Campo para nome do estabelecimento
  establishment_id: string | null; // Campo para ID do estabelecimento
  notes_count: number;
  attachments_count: number;
}

export type ServiceOrderFormValues = Omit<ServiceOrder, 'id' | 'created_at' | 'client' | 'display_id' | 'equipment_id' | 'updated_at' | 'scheduled_date' | 'notes_count' | 'attachments_count' | 'establishment_id'> & {
    serial_number: string | undefined;
    model: string | undefined;
    equipment_id?: string;
    scheduled_date?: Date | null;
    establishment_id?: string | null;
};

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
    mutationFn: async (orderData: ServiceOrderFormValues) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      
      const displayId = generateDisplayId(orderData.store);
      
      const { data, error } = await supabase
        .from('service_orders')
        .insert({
          ...orderData,
          display_id: displayId,
          created_by: user.id,
          model: orderData.model || null,
          serial_number: orderData.serial_number || null,
          equipment_id: orderData.equipment_id || null,
          establishment_id: orderData.establishment_id || null,
          establishment_name: orderData.establishment_name || null,
          scheduled_date: orderData.scheduled_date ? orderData.scheduled_date.toISOString() : null,
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
    mutationFn: async ({ id, ...orderData }: ServiceOrderFormValues & { id: string }) => {
      const { data, error } = await supabase
        .from('service_orders')
        .update({
          ...orderData,
          updated_at: new Date().toISOString(),
          model: orderData.model || null,
          serial_number: orderData.serial_number || null,
          equipment_id: orderData.equipment_id || null,
          establishment_id: orderData.establishment_id || null,
          establishment_name: orderData.establishment_name || null,
          scheduled_date: orderData.scheduled_date ? orderData.scheduled_date.toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { updatedOrder: data as ServiceOrder, oldOrder: null }; // Simplificado para evitar fetch extra
    },
    onSuccess: ({ updatedOrder }) => {
      logActivity(user, {
        entity_type: 'service_order',
        entity_id: updatedOrder.id,
        action_type: 'updated',
        content: `OS "${updatedOrder.display_id}" foi atualizada.`,
      });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
    },
  });
  
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase.from('service_orders').delete().eq('id', orderId);
      if (error) throw error;
      return orderId;
    },
    onSuccess: (deletedOrderId) => {
      const orders = queryClient.getQueryData<ServiceOrder[]>(['serviceOrders']);
      const orderToDelete = orders?.find(o => o.id === deletedOrderId);
      if (orderToDelete) {
        logActivity(user, {
          entity_type: 'service_order',
          entity_id: orderToDelete.id,
          action_type: 'deleted',
          content: `OS "${orderToDelete.display_id}" foi excluída.`,
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