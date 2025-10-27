import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { format } from "date-fns";

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
  status: "Pendente" | "Em Progresso" | "Concluída" | "Cancelada";
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS";
  created_at: string;
}

// O tipo ServiceOrderFormValues agora é o que o ServiceOrderForm envia, que inclui os detalhes do equipamento
export type ServiceOrderFormValues = Omit<ServiceOrder, 'id' | 'created_at' | 'client' | 'display_id' | 'equipment_id'> & {
    serial_number: string | undefined;
    model: string | undefined;
    equipment_id?: string; // Opcional na mutação, mas deve ser fornecido pelo formulário
};

// Tipo de retorno da query com o join (usamos 'any' para o clients para evitar conflitos de tipagem complexos do Supabase)
type ServiceOrderRaw = Omit<ServiceOrder, 'client'> & {
    clients: { name: string } | { name: string }[] | null;
};

// Função auxiliar para gerar o ID formatado
const generateDisplayId = (store: ServiceOrder['store'], uuid: string): string => {
    const prefix = store === 'CALDAS DA RAINHA' ? 'CR' : 'PM';
    const datePart = format(new Date(), 'yyMMdd');
    // Usamos os primeiros 4 caracteres do UUID para o sufixo
    const suffix = uuid.substring(0, 4).toUpperCase();
    return `${prefix}-${datePart}-${suffix}`;
};

// Função de fetch
const fetchServiceOrders = async (userId: string | undefined): Promise<ServiceOrder[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
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
      client_id,
      equipment_id,
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
        display_id: order.display_id,
        client: clientName, 
        status: order.status as ServiceOrder['status'],
        store: order.store as ServiceOrder['store'],
        created_at: order.created_at,
        serial_number: order.serial_number,
        model: order.model,
        equipment_id: order.equipment_id,
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
      
      // 1. Inserir a ordem para obter o UUID gerado pelo banco
      const { data: initialData, error: initialError } = await supabase
        .from('service_orders')
        .insert({
          equipment: orderData.equipment,
          model: orderData.model || null,
          serial_number: orderData.serial_number || null,
          description: orderData.description,
          status: orderData.status,
          store: orderData.store,
          client_id: orderData.client_id,
          equipment_id: orderData.equipment_id || null, // Persiste o ID do equipamento
          created_by: user.id,
        })
        .select('id')
        .single();

      if (initialError) throw initialError;
      
      const orderId = initialData.id;
      
      // 2. Gerar o display_id usando o UUID e a loja
      const displayId = generateDisplayId(orderData.store, orderId);

      // 3. Atualizar a ordem com o display_id
      const { data, error } = await supabase
        .from('service_orders')
        .update({ display_id: displayId })
        .eq('id', orderId)
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
      // Nota: O display_id não é atualizado aqui, pois é gerado apenas na criação.
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
          equipment_id: orderData.equipment_id || null, // Persiste o ID do equipamento
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
  
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalida todas as queries de OS para atualizar a lista
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