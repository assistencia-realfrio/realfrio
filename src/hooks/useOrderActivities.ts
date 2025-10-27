import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

export interface OrderActivity {
  id: string;
  order_id: string;
  user_id: string;
  content: string;
  type: 'note' | 'status_update';
  created_at: string;
  // Adicionar informações do usuário que criou a atividade (opcional, via join)
  profiles?: { first_name: string | null, last_name: string | null } | null;
}

interface CreateActivityPayload {
  order_id: string;
  content: string;
  type?: 'note' | 'status_update';
}

// Função de fetch para buscar atividades de uma OS
const fetchOrderActivities = async (orderId: string, userId: string | undefined): Promise<OrderActivity[]> => {
  if (!userId || !orderId) return [];

  const { data, error } = await supabase
    .from('order_activities')
    .select(`
      id,
      order_id,
      user_id,
      content,
      type,
      created_at,
      profiles (first_name, last_name)
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: false }); // Ordenar da mais recente para a mais antiga

  if (error) throw error;

  return data as unknown as OrderActivity[];
};

export const useOrderActivities = (orderId: string) => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  // A chave da query deve ser consistente
  const queryKey = ['orderActivities', orderId];

  const { data: activities = [], isLoading, isFetching } = useQuery<OrderActivity[], Error>({
    queryKey: queryKey,
    queryFn: () => fetchOrderActivities(orderId, user?.id),
    enabled: !!user?.id && !!orderId,
  });

  const createActivityMutation = useMutation({
    mutationFn: async (payload: CreateActivityPayload) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const { data, error } = await supabase
        .from('order_activities')
        .insert({
          order_id: payload.order_id,
          user_id: user.id,
          content: payload.content,
          type: payload.type || 'note',
        })
        .select()
        .single();

      if (error) throw error;
      return data as OrderActivity;
    },
    onSuccess: () => {
      // Invalida a query específica para este orderId
      queryClient.invalidateQueries({ queryKey: ['orderActivities', orderId] });
    },
  });

  return {
    activities,
    isLoading,
    isFetching, // Expondo isFetching
    createActivity: createActivityMutation,
  };
};