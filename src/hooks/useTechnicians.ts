import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Profile } from "./useProfile";

// Função para buscar todos os perfis (técnicos)
const fetchTechnicians = async (userId: string | undefined): Promise<Profile[]> => {
  if (!userId) return [];

  // Fetch all profiles. RLS is set to allow all authenticated users to view profiles.
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, store, avatar_url')
    .order('first_name', { ascending: true });

  if (error) throw error;

  return data as Profile[];
};

export const useTechnicians = () => {
  const { user } = useSession();

  const { data: technicians = [], isLoading } = useQuery<Profile[], Error>({
    queryKey: ['technicians', user?.id],
    queryFn: () => fetchTechnicians(user?.id),
    enabled: !!user?.id,
  });

  return {
    technicians,
    isLoading,
  };
};