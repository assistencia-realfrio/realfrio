"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from "@/contexts/SessionContext";
import { ClientFormData, Client } from "@/components/ClientForm";
import { useServiceOrders } from "./useServiceOrders"; // Importando o hook de OS

// Fetch all clients
const fetchClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// Hook to fetch clients
export const useClients = () => {
  return useQuery<Client[], Error>({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });
};

// Hook to create a new client
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const userId = session?.user?.id;

  return useMutation<Client, Error, ClientFormData>({
    mutationFn: async (clientData) => {
      if (!userId) throw new Error("User not authenticated.");

      const payload = {
        ...clientData,
        created_by: userId,
        contact: clientData.contact || null,
        email: clientData.email || null,
        locality: clientData.locality || null,
        maps_link: clientData.maps_link || null,
        google_drive_link: clientData.google_drive_link || null,
      };

      const { data, error } = await supabase
        .from('clients')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};