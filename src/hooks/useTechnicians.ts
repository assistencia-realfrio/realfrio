import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Profile } from "./useProfile";

export interface Technician extends Profile {
    full_name: string;
}

const fetchTechnicians = async (userId: string | undefined): Promise<Technician[]> => {
  if (!userId) return [];

  // Busca todos os perfis.
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, store'); // Fetch necessary fields

  if (error) throw error;

  return data.map((profile: any) => {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    const full_name = `${firstName} ${lastName}`.trim() || 'Usuário Desconhecido';
    
    return {
        ...profile,
        full_name,
    };
  }) as Technician[];
};

export const useTechnicians = () => {
  const { user } = useSession();

  return useQuery<Technician[], Error>({
    queryKey: ['technicians'],
    queryFn: () => fetchTechnicians(user?.id),
    enabled: !!user?.id,
  });
};