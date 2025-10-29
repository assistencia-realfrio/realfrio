import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface Activity {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action_type: string;
  content: string;
  created_at: string;
  // Joined data
  user_full_name: string;
  time_ago: string;
}

const fetchActivities = async (userId: string | undefined, entity?: { type: string; id: string }): Promise<Activity[]> => {
  if (!userId) return [];

  let query = supabase
    .from('activities')
    .select(`
      *,
      profiles (first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  if (entity) {
    query = query.eq('entity_type', entity.type).eq('entity_id', entity.id);
  } else {
    // For the global feed in notifications, limit to the 10 most recent.
    query = query.limit(10);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data.map((activity: any) => {
    const firstName = activity.profiles?.first_name || '';
    const lastName = activity.profiles?.last_name || '';
    const userFullName = `${firstName} ${lastName}`.trim() || 'Usuário Desconhecido';

    return {
      id: activity.id,
      user_id: activity.user_id,
      entity_type: activity.entity_type,
      entity_id: activity.entity_id,
      action_type: activity.action_type,
      content: activity.content,
      created_at: activity.created_at,
      user_full_name: userFullName,
      time_ago: formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR }),
    };
  });
};

export const useActivities = (entity?: { type: string; id: string }) => {
  const { user } = useSession();

  return useQuery<Activity[], Error>({
    queryKey: ['activities', user?.id, entity?.type, entity?.id],
    queryFn: () => fetchActivities(user?.id, entity),
    enabled: !!user?.id,
    // Refetch the global feed every minute, but not for specific entity logs
    refetchInterval: entity ? false : 60 * 1000,
  });
};