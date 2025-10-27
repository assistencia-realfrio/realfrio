import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

export interface ServiceOrder {
  id: string;
  title: string;
  client: string; // Nome do cliente
  client_id: string; // ID do cliente
  description: string;
  status: "Pendente" | "Em Progresso" | "Concluída" | "Cancelada";
  priority: "Alta" | "Média" | "Baixa";
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS";
  created_at: string;
}

export type ServiceOrderFormValues = Omit<ServiceOrder, 'id' | 'created_at' | 'client_id'> & { client_id: string };

// Função de fetch
const fetchServiceOrders = async (userId: string | undefined): Promise<ServiceOrder[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('service_orders')
    .select(`
      id, 
      title, 
      description, 
      status, 
      priority, 
      store, 
      created_at,
      client_id,
      clients (name)
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(order => ({
    ...order,
    id: order.id,
    client: order.clients.name,
    status: order.status as ServiceOrder['status'],
    priority: order.priority as ServiceOrder['priority'],
    store: order.store as ServiceOrder['store'],
    created_at: order.created_at,
  })) as ServiceOrder[];
};

// Hook principal
export const useServiceOrders = (id?: string) => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const queryKey = id ? ['serviceOrders', id] : ['serviceOrders'];

  const { data: orders, isLoading } = useQuery<ServiceOrder[], Error>({
    queryKey: queryKey,
    queryFn: () => fetchServiceOrders(user?.id),
    enabled: !!user?.id,
    select: (data) => {
      if (id) {
        // Se um ID for fornecido, retorna apenas o item correspondente
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
      
      const { data, error } = await supabase
        .from('service_orders')
        .insert({
          title: orderData.title,
          description: orderData.description,
          priority: orderData.priority,
          status: orderData.status,
          store: orderData.store,
          client_id: orderData.client_id,
          created_by: user.id,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, ...orderData }: ServiceOrderFormValues & { id: string }) => {
      const { data, error } = await supabase
        .from('service_orders')
        .update({
          title: orderData.title,
          description: orderData.description,
          priority: orderData.priority,
          status: orderData.status,
          store: orderData.store,
          client_id: orderData.client_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders', id] });
    },
  });

  return {
    orders: orders || [],
    order,
    isLoading,
    createOrder: createOrderMutation,
    updateOrder: updateOrderMutation,
  };
};