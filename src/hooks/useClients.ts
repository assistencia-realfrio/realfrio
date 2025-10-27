import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { ClientFormValues } from "@/components/ClientForm";

export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  status: "Ativo" | "Inativo";
  totalOrders: number; // Este campo será mockado ou calculado no frontend por enquanto
}

// Função de fetch
const fetchClients = async (userId: string | undefined): Promise<Client[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, contact, email, status, created_at')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Mocking totalOrders as it requires a join/count query which is complex for a simple fetch
  return data.map(client => ({
    ...client,
    totalOrders: Math.floor(Math.random() * 10), // Mocked value
    status: client.status as "Ativo" | "Inativo",
  })) as Client[];
};

// Hook principal
export const useClients = (searchTerm: string = "") => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery<Client[], Error>({
    queryKey: ['clients', user?.id],
    queryFn: () => fetchClients(user?.id),
    enabled: !!user?.id,
  });

  const filteredClients = clients.filter(client => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(lowerCaseSearch) ||
      client.contact.toLowerCase().includes(lowerCaseSearch) ||
      client.email.toLowerCase().includes(lowerCaseSearch)
    );
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: ClientFormValues) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          contact: clientData.contact,
          email: clientData.email || null,
          created_by: user.id,
          status: 'Ativo', // Default status
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...clientData }: ClientFormValues & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: clientData.name,
          contact: clientData.contact,
          email: clientData.email || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return {
    clients: filteredClients,
    isLoading,
    createClient: createClientMutation,
    updateClient: updateClientMutation,
    deleteClient: deleteClientMutation,
  };
};

// Hook para buscar um cliente específico (usado no ServiceOrderForm)
export const useClientNames = () => {
  const { user } = useSession();
  return useQuery<Client[], Error>({
    queryKey: ['clientNames', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('created_by', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user?.id,
  });
};