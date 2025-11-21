import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { logActivity } from "@/utils/activityLogger";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  store: 'CALDAS DA RAINHA' | 'PORTO DE MÓS' | null; // NOVO: Loja associada ao perfil
}

interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  store?: 'CALDAS DA RAINHA' | 'PORTO DE MÓS' | null; // NOVO: Permitir atualização da loja
}

const fetchProfile = async (userId: string | undefined): Promise<Profile | null> => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code === 'PGRST116') { // No rows found
    return null;
  }
  if (error) {
    throw error;
  }
  return data as Profile;
};

export const useProfile = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery<Profile | null, Error>({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user?.id),
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      // Obter o perfil antigo antes da atualização
      const oldProfile = queryClient.getQueryData<Profile | null>(['profile', user.id]);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { updatedProfile: data as Profile, oldProfile };
    },
    onSuccess: ({ updatedProfile, oldProfile }) => {
      const changes: Record<string, { oldValue?: any; newValue?: any }> = {};

      // Comparar e registrar alterações
      if (oldProfile?.first_name !== updatedProfile.first_name) {
        changes.first_name = { oldValue: oldProfile?.first_name, newValue: updatedProfile.first_name };
      }
      if (oldProfile?.last_name !== updatedProfile.last_name) {
        changes.last_name = { oldValue: oldProfile?.last_name, newValue: updatedProfile.last_name };
      }
      if (oldProfile?.store !== updatedProfile.store) {
        changes.store = { oldValue: oldProfile?.store, newValue: updatedProfile.store };
      }
      // Adicionar outros campos do perfil que podem ser atualizados, se houver

      logActivity(user, {
        entity_type: 'profile', // Novo tipo de entidade para logs de perfil
        entity_id: updatedProfile.id,
        action_type: 'updated',
        content: `Perfil do utilizador ${updatedProfile.first_name || ''} ${updatedProfile.last_name || ''} foi atualizado.`,
        details: changes, // Passar os detalhes das alterações
      });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['activities'] }); // Invalida atividades para atualizar nomes
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] }); // Invalida todos os perfis para atualizar nomes no calendário
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation,
  };
};