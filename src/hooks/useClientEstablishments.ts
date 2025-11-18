import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

export interface Establishment {
  id: string;
  client_id: string;
  name: string;
  locality: string | null;
  google_maps_link: string | null;
  phone: string | null; // Novo campo
  created_at: string;
}

export interface EstablishmentFormValues {
  client_id: string;
  name: string;
  locality?: string;
  google_maps_link?: string;
  phone?: string; // Novo campo
}

const fetchEstablishments = async (clientId: string): Promise<Establishment[]> => {
  const { data, error } = await supabase
    .from('client_establishments')
    .select('id, client_id, name, locality, google_maps_link, phone, created_at') // Adicionado 'phone'
    .eq('client_id', clientId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Establishment[];
};

export const useClientEstablishments = (clientId: string) => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: establishments = [], isLoading } = useQuery<Establishment[], Error>({
    queryKey: ['establishments', clientId],
    queryFn: () => fetchEstablishments(clientId),
    enabled: !!clientId,
  });

  const createEstablishmentMutation = useMutation({
    mutationFn: async (establishmentData: EstablishmentFormValues) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from('client_establishments')
        .insert({
          ...establishmentData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Establishment;
    },
    onSuccess: (newEstablishment) => {
      queryClient.invalidateQueries({ queryKey: ['establishments', newEstablishment.client_id] });
    },
  });

  const updateEstablishmentMutation = useMutation({
    mutationFn: async ({ id, ...establishmentData }: EstablishmentFormValues & { id: string }) => {
      const { data, error } = await supabase
        .from('client_establishments')
        .update({
          name: establishmentData.name,
          locality: establishmentData.locality,
          google_maps_link: establishmentData.google_maps_link,
          phone: establishmentData.phone, // Adicionado 'phone'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Establishment;
    },
    onSuccess: (updatedEstablishment) => {
      queryClient.invalidateQueries({ queryKey: ['establishments', updatedEstablishment.client_id] });
    },
  });

  const deleteEstablishmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('client_establishments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['establishments', clientId] });
    },
  });

  return {
    establishments,
    isLoading,
    createEstablishment: createEstablishmentMutation,
    updateEstablishment: updateEstablishmentMutation,
    deleteEstablishment: deleteEstablishmentMutation,
  };
};