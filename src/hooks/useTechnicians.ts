import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Profile } from "./useProfile"; // Reutilizando a interface Profile

export interface Technician extends Profile {
    full_name: string;
}

const fetchTechnicians = async (): Promise<Technician[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url')
    .order('first_name', { ascending: true });

  if (error) throw error;

  return data.map(profile => ({
    ...profile,
    full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Técnico Desconhecido',
  })) as Technician[];
};

export const useTechnicians = () => {
  const { user } = useSession();

  return useQuery<Technician[], Error>({
    queryKey: ['technicians'],
    queryFn: fetchTechnicians,
    enabled: !!user?.id,
  });
};