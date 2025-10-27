import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

export interface ServiceOrder {
  id: string;
  equipment: string; // Novo
  model: string | null; // Agora pode ser null
  serial_number: string | null; 
  client: string; // Nome do cliente
  client_id: string; // ID do cliente
  description: string;
  status: "Pendente" | "Em Progresso" | "Concluída" | "Cancelada";
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS";
  created_at: string;
}

// O tipo ServiceOrderFormValues deve ser baseado apenas nos campos que o formulário envia para o banco.
export type ServiceOrderFormValues = Omit<ServiceOrder, 'id' | 'created_at' | 'client' | 'serial_number' | 'model'> & {
    serial_number: string | undefined; // Tornando opcional no formulário
    model: string | undefined; // Tornando opcional no formulário
};

// Tipo de retorno da query com o join (usamos 'any' para o clients para evitar conflitos de tipagem complexos do Supabase)
type ServiceOrderRaw = Omit<ServiceOrder, 'client'> & {
    clients: { name: string } | { name: string }[] | null;
};

// Função de fetch
const fetchServiceOrders = async (userId: string | undefined): Promise<ServiceOrder[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('service_orders')
    .select(`
      id, 
      equipment, 
      model, 
      serial_number, 
      description, 
      status, 
      store, 
      created_at,
      client_id,
      clients (name)
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Usamos 'unknown' como intermediário para forçar a conversão e depois mapeamos
  return (data as unknown as ServiceOrderRaw[]).map(order => {
    // Lógica para extrair o nome do cliente, tratando se for objeto ou array (embora objeto seja o esperado para 1:1)
    const clientName = Array.isArray(order.clients) 
        ? order.clients[0]?.name || 'Cliente Desconhecido'
        : order.clients?.name || 'Cliente Desconhecido';

    return {
        ...order,
        id: order.id,
        client: clientName, 
        status: order.status as ServiceOrder['status'],
        store: order.store as ServiceOrder['store'],
        created_at: order.created_at,
        serial_number: order.serial_number,
        model: order.model,
    };
  }) as ServiceOrder[];
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
          equipment: orderData.equipment,
          model: orderData.model || null, // Trata undefined/vazio como null
          serial_number: orderData.serial_number || null,
          description: orderData.description,
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
          equipment: orderData.equipment,
          model: orderData.model || null, // Trata undefined/vazio como null
          serial_number: orderData.serial_number || null,
          description: orderData.description,
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