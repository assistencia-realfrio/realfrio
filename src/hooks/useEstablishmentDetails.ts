import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Establishment } from "./useClientEstablishments";

const fetchEstablishmentDetails = async (establishmentId: string): Promise<Establishment | null> => {
  const { data, error } = await supabase
    .from('client_establishments')
    .select('id, client_id, name, locality, google_maps_link, phone, created_at')
    .eq('id', establishmentId)
    .single();

  if (error && error.code === 'PGRST116') {
    return null;
  }
  if (error) {
    throw error;
  }
  return data as Establishment;
};

export const useEstablishmentDetails = (establishmentId: string | null | undefined) => {
  const { user } = useSession();

  return useQuery<Establishment | null, Error>({
    queryKey: ['establishmentDetails', establishmentId],
    queryFn: () => fetchEstablishmentDetails(establishmentId!),
    enabled: !!user?.id && !!establishmentId,
  });
};