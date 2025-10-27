import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { ClientFormValues } from "@/components/ClientForm";
import { useServiceOrders } from "./useServiceOrders"; // Importando o hook de OS

export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  status: "Ativo" | "Inativo";
  totalOrders: number; // Este campo será calculado no frontend
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

  // Retorna os dados brutos do cliente, sem o totalOrders ainda
  return data.map(client => ({
    ...client,
    totalOrders: 0, // Inicializa com 0
    status: client.status as "Ativo" | "Inativo",
  })) as Client[];
};

// Hook principal
export const useClients = (searchTerm: string = "") => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { orders } = useServiceOrders(); // Obtém todas as ordens de serviço

  const { data: rawClients = [], isLoading: isLoadingClients } = useQuery<Client[], Error>({
    queryKey: ['clients', user?.id],
    queryFn: () => fetchClients(user?.id),
    enabled: !!user?.id,
  });

  // 1. Calcular a contagem de OS por cliente
  const orderCounts = orders.reduce((acc, order) => {
    acc[order.client_id] = (acc[order.client_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Adicionar a contagem de OS aos dados do cliente
  const clientsWithCounts = rawClients.map(client => ({
    ...client,
    totalOrders: orderCounts[client.id] || 0,
  }));

  const filteredClients = clientsWithCounts.filter(client => {
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
          contact: clientData.contact || null,
          email: clientData.email || null,
          created_by: user.id,
          status: 'Ativo', // Default status
        })
        .select()
        .single();

      if (error) throw error;
      // Retorna o objeto completo do cliente criado
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      // NOVO: Invalida a query de nomes de clientes para atualizar o seletor
      queryClient.invalidateQueries({ queryKey: ['clientNames'] }); 
      // Invalida ordens também, caso a contagem seja necessária imediatamente
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); 
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...clientData }: ClientFormValues & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: clientData.name,
          contact: clientData.contact || null,
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
      queryClient.invalidateQueries({ queryKey: ['clientNames'] }); 
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
      queryClient.invalidateQueries({ queryKey: ['clientNames'] }); 
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); // Invalida ordens para garantir que as contagens sejam atualizadas
    },
  });

  return {
    clients: filteredClients,
    isLoading: isLoadingClients,
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