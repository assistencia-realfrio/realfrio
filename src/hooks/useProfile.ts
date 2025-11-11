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
}

interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
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
      if (!user?.id) throw new Error("USUÁRIO NÃO AUTENTICADO.");

      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: payload.first_name?.toUpperCase() || null,
          last_name: payload.last_name?.toUpperCase() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (updatedProfile) => {
      logActivity(user, {
        entity_type: 'profile', // Novo tipo de entidade para logs de perfil
        entity_id: updatedProfile.id,
        action_type: 'updated',
        content: `PERFIL DO UTILIZADOR ${updatedProfile.first_name || ''} ${updatedProfile.last_name || ''} FOI ATUALIZADO.`,
      });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['activities'] }); // Invalida atividades para atualizar nomes
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation,
  };
};