import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { logActivity } from "@/utils/activityLogger";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface TimeEntry {
  id: string;
  service_order_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  description: string | null;
  created_at: string;
  user_full_name: string;
}

interface CreateTimeEntryPayload {
  service_order_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  description?: string;
}

interface UpdateTimeEntryPayload {
  id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  description?: string;
}

const fetchTimeEntries = async (serviceOrderId: string, userId: string | undefined): Promise<TimeEntry[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      profiles (first_name, last_name)
    `)
    .eq('service_order_id', serviceOrderId)
    .eq('user_id', userId) // Apenas as entradas de tempo do utilizador logado
    .order('start_time', { ascending: false });

  if (error) throw error;

  return data.map((entry: any) => {
    const firstName = entry.profiles?.first_name || '';
    const lastName = entry.profiles?.last_name || '';
    const userFullName = `${firstName} ${lastName}`.trim() || 'Usuário Desconhecido';

    return {
      id: entry.id,
      service_order_id: entry.service_order_id,
      user_id: entry.user_id,
      start_time: entry.start_time,
      end_time: entry.end_time,
      duration_minutes: entry.duration_minutes,
      description: entry.description,
      created_at: entry.created_at,
      user_full_name: userFullName,
    };
  });
};

export const useTimeEntries = (serviceOrderId: string) => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: timeEntries, isLoading, error } = useQuery<TimeEntry[], Error>({
    queryKey: ['timeEntries', serviceOrderId, user?.id],
    queryFn: () => fetchTimeEntries(serviceOrderId, user?.id),
    enabled: !!user?.id && !!serviceOrderId,
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: async (payload: CreateTimeEntryPayload) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          service_order_id: payload.service_order_id,
          user_id: user.id,
          start_time: payload.start_time,
          end_time: payload.end_time,
          duration_minutes: payload.duration_minutes,
          description: payload.description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newEntry) => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', serviceOrderId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] }); // Invalida métricas para atualizar tempo total
      logActivity(user, {
        entity_type: 'service_order',
        entity_id: serviceOrderId,
        action_type: 'created',
        content: `Registou ${newEntry.duration_minutes} minutos de trabalho na OS.`,
        details: { description: { newValue: newEntry.description } }
      });
    },
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: async (payload: UpdateTimeEntryPayload) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const { data, error } = await supabase
        .from('time_entries')
        .update({
          start_time: payload.start_time,
          end_time: payload.end_time,
          duration_minutes: payload.duration_minutes,
          description: payload.description || null,
        })
        .eq('id', payload.id)
        .eq('user_id', user.id) // Garante que apenas o próprio utilizador pode editar
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', serviceOrderId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] }); // Invalida métricas para atualizar tempo total
      logActivity(user, {
        entity_type: 'service_order',
        entity_id: serviceOrderId,
        action_type: 'updated',
        content: `Atualizou um registo de tempo na OS.`,
        details: { description: { newValue: updatedEntry.description } }
      });
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (timeEntryId: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', timeEntryId)
        .eq('user_id', user.id); // Garante que apenas o próprio utilizador pode excluir

      if (error) throw error;
      return timeEntryId;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', serviceOrderId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] }); // Invalida métricas para atualizar tempo total
      logActivity(user, {
        entity_type: 'service_order',
        entity_id: serviceOrderId,
        action_type: 'deleted',
        content: `Removeu um registo de tempo da OS.`,
        details: { timeEntryId: { oldValue: deletedId, newValue: 'Removido' } }
      });
    },
  });

  return {
    timeEntries,
    isLoading,
    error,
    createTimeEntry: createTimeEntryMutation,
    updateTimeEntry: updateTimeEntryMutation,
    deleteTimeEntry: deleteTimeEntryMutation,
  };
};