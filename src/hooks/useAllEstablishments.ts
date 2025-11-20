import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Establishment } from "./useClientEstablishments";

export interface EstablishmentWithClient extends Establishment {
  client_name: string;
}

const fetchAllEstablishments = async (userId: string | undefined): Promise<EstablishmentWithClient[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('client_establishments')
    .select(`
      id, client_id, name, locality, google_maps_link, phone, created_at,
      clients (name)
    `)
    .order('name', { ascending: true });

  if (error) throw error;

  return data.map((est: any) => ({
      ...est,
      client_name: est.clients?.name || 'Cliente Desconhecido',
  })) as EstablishmentWithClient[];
};

export const useAllEstablishments = (searchTerm: string = "") => {
    const { user } = useSession();

    const { data: establishments = [], isLoading } = useQuery<EstablishmentWithClient[], Error>({
        queryKey: ['allEstablishments', user?.id],
        queryFn: () => fetchAllEstablishments(user?.id),
        enabled: !!user?.id,
    });

    const filteredEstablishments = establishments.filter(establishment => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        return (
            establishment.name.toLowerCase().includes(lowerCaseSearch) ||
            (establishment.locality && establishment.locality.toLowerCase().includes(lowerCaseSearch)) ||
            (establishment.phone && establishment.phone.toLowerCase().includes(lowerCaseSearch)) ||
            establishment.client_name.toLowerCase().includes(lowerCaseSearch)
        );
    });

    return {
        establishments: filteredEstablishments,
        isLoading,
    };
}