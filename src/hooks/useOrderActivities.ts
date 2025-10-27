import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface OrderActivity {
  id: string;
  order_id: string;
  user_id: string;
  content: string;
  type: 'note' | 'status_change' | 'time_entry' | 'attachment'; // Tipos de atividade
  created_at: string;
  // Dados unidos de outras tabelas
  order_display_id: string;
  client_name: string;
  user_full_name: string;
  time_ago: string; // Tempo desde a atividade (ex: "há 5 minutos")
}

const fetchOrderActivities = async (userId: string | undefined): Promise<OrderActivity[]> => {
  if (!userId) return [];

  // Busca as atividades, juntando com service_orders, clients e profiles
  const { data, error } = await supabase
    .from('order_activities')
    .select(`
      id,
      order_id,
      user_id,
      content,
      type,
      created_at,
      service_orders (
        display_id,
        clients (name)
      ),
      profiles (first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5); // Limita às 5 atividades mais recentes

  if (error) throw error;

  return data.map((activity: any) => {
    const clientName = Array.isArray(activity.service_orders?.clients)
      ? activity.service_orders.clients[0]?.name || 'Cliente Desconhecido'
      : activity.service_orders?.clients?.name || 'Cliente Desconhecido';

    const firstName = activity.profiles?.first_name || '';
    const lastName = activity.profiles?.last_name || '';
    const userFullName = `${firstName} ${lastName}`.trim() || 'Usuário Desconhecido';

    return {
      id: activity.id,
      order_id: activity.order_id,
      user_id: activity.user_id,
      content: activity.content,
      type: activity.type,
      created_at: activity.created_at,
      order_display_id: activity.service_orders?.display_id || 'OS Desconhecida',
      client_name: clientName,
      user_full_name: userFullName,
      time_ago: formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR }),
    };
  });
};

export const useOrderActivities = () => {
  const { user } = useSession();

  return useQuery<OrderActivity[], Error>({
    queryKey: ['orderActivities', user?.id],
    queryFn: () => fetchOrderActivities(user?.id),
    enabled: !!user?.id,
    refetchInterval: 60 * 1000, // Atualiza a cada minuto para novas notificações
  });
};