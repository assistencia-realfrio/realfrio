import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Profile } from "./useProfile"; // Reutiliza a interface Profile

const fetchAllProfiles = async (currentUserId: string | undefined): Promise<Profile[]> => {
  if (!currentUserId) return []; // Só busca se houver um utilizador logado

  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, store'); // Seleciona os campos necessários

  if (error) throw error;
  return data as Profile[];
};

export const useAllProfiles = () => {
  const { user } = useSession();

  return useQuery<Profile[], Error>({
    queryKey: ['allProfiles'],
    queryFn: () => fetchAllProfiles(user?.id),
    enabled: !!user?.id,
  });
};