import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { ClientFormValues } from "@/components/ClientForm";
import { useServiceOrders } from "./useServiceOrders"; // Importando o hook de OS

export interface Client {
  id: string;
  name: string;
  contact: string | null; // Pode ser string ou null
  email: string | null; // Pode ser string ou null
  totalOrders: number; // Este campo será calculado no frontend
  openOrders: number; // NOVO: Campo para OS em aberto
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS" | null; // NOVO: Campo para a loja associada
  address: string | null; // NOVO: Campo para a morada
}

// Função de fetch para buscar TODOS os clientes (para a lista)
const fetchClientsList = async (userId: string | undefined): Promise<Client[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, contact, email, created_at, store, address') // Adicionando 'address'
    .eq('created_by', userId)
    .order('name', { ascending: true }); // Ordenar por nome alfabeticamente

  if (error) throw error;

  // Retorna os dados brutos do cliente, sem o totalOrders e openOrders ainda
  return data.map(client => ({
    ...client,
    totalOrders: 0, // Inicializa com 0
    openOrders: 0, // Inicializa com 0
    store: client.store as "CALDAS DA RAINHA" | "PORTO DE MÓS" | null, // Tipagem para o campo 'store'
    address: client.address || null, // Garante que address seja string ou null
  })) as Client[];
};

// Função para buscar um ÚNICO cliente por ID (para a página de detalhes)
const fetchClientDetails = async (userId: string | undefined, clientId: string): Promise<Client | null> => {
  if (!userId || !clientId) return null;

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, contact, email, created_at, store, address')
    .eq('created_by', userId)
    .eq('id', clientId)
    .single();

  if (error && error.code === 'PGRST116') { // PGRST116 significa que nenhuma linha foi encontrada
    return null;
  }
  if (error) {
    throw error;
  }

  return data ? {
    ...data,
    totalOrders: 0, // Será populado pelo useServiceOrders se necessário
    openOrders: 0,
    store: data.store as "CALDAS DA RAINHA" | "PORTO DE MÓS" | null,
    address: data.address || null,
  } : null;
};

// Hook para a lista de clientes (com busca e filtro)
export const useClientsList = (searchTerm: string = "", storeFilter: "ALL" | Client['store'] | null = "ALL") => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { orders } = useServiceOrders(); // Obtém todas as ordens de serviço

  const { data: rawClients = [], isLoading: isLoadingClients } = useQuery<Client[], Error>({
    queryKey: ['clientsList', user?.id],
    queryFn: () => fetchClientsList(user?.id),
    enabled: !!user?.id,
  });

  // 1. Calcular a contagem de OS por cliente (total e em aberto)
  const orderCounts = orders.reduce((acc, order) => {
    acc[order.client_id] = acc[order.client_id] || { total: 0, open: 0 };
    acc[order.client_id].total++;
    if (order.status === "Pendente" || order.status === "Em Progresso") {
      acc[order.client_id].open++;
    }
    return acc;
  }, {} as Record<string, { total: number; open: number }>);

  // 2. Adicionar a contagem de OS aos dados do cliente
  const clientsWithCounts = rawClients.map(client => ({
    ...client,
    totalOrders: orderCounts[client.id]?.total || 0,
    openOrders: orderCounts[client.id]?.open || 0, // Adiciona a contagem de OS em aberto
  }));

  // 3. Filtrar por loja primeiro
  const filteredByStore = storeFilter === "ALL"
    ? clientsWithCounts
    : clientsWithCounts.filter(client => client.store === storeFilter);

  // 4. Em seguida, filtrar por termo de busca
  const filteredClients = filteredByStore.filter(client => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(lowerCaseSearch) ||
      client.contact?.toLowerCase().includes(lowerCaseSearch) || // Adicionado '?' para contact
      client.email?.toLowerCase().includes(lowerCaseSearch) || // Adicionado '?' para email
      client.address?.toLowerCase().includes(lowerCaseSearch) // NOVO: Busca por morada
    );
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: ClientFormValues) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          contact: clientData.contact, // Usando o valor transformado pelo Zod
          email: clientData.email,     // Usando o valor transformado pelo Zod
          created_by: user.id,
          store: clientData.store,
          address: clientData.address, // Usando o valor transformado pelo Zod
        })
        .select()
        .single();

      if (error) {
        console.error("Erro do Supabase na criação do cliente:", error); // Log do erro do Supabase
        throw error;
      }
      // Retorna o objeto completo do cliente criado
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientsList'] });
      queryClient.invalidateQueries({ queryKey: ['clientNames'] }); 
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); 
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
      queryClient.invalidateQueries({ queryKey: ['clientsList'] });
      queryClient.invalidateQueries({ queryKey: ['clientNames'] }); 
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); // Invalida ordens para garantir que as contagens sejam atualizadas
    },
  });

  return {
    clients: filteredClients,
    isLoading: isLoadingClients,
    createClient: createClientMutation,
    deleteClient: deleteClientMutation, // EXPOR A MUTATION DE DELETE AQUI
  };
};

// Hook para os detalhes de um cliente específico
export const useClientDetails = (clientId: string | undefined) => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { orders } = useServiceOrders();

  const { data: rawClient, isLoading: isLoadingClientDetails } = useQuery<Client | null, Error>({
    queryKey: ['clientDetails', clientId, user?.id],
    queryFn: () => fetchClientDetails(user?.id, clientId!),
    enabled: !!user?.id && !!clientId,
  });

  // Calcular a contagem de OS para este cliente específico
  const orderCounts = orders.reduce((acc, order) => {
    if (order.client_id === clientId) {
      acc.total = (acc.total || 0) + 1;
      if (order.status === "Pendente" || order.status === "Em Progresso") {
        acc.open = (acc.open || 0) + 1;
      }
    }
    return acc;
  }, { total: 0, open: 0 } as { total: number; open: number });

  const clientWithCounts = rawClient ? {
    ...rawClient,
    totalOrders: orderCounts.total,
    openOrders: orderCounts.open,
  } : null;

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...clientData }: ClientFormValues & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: clientData.name,
          contact: clientData.contact,
          email: clientData.email,
          store: clientData.store,
          address: clientData.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Erro do Supabase na atualização do cliente:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: ['clientDetails', updatedClient.id] });
      queryClient.invalidateQueries({ queryKey: ['clientsList'] });
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
      queryClient.invalidateQueries({ queryKey: ['clientsList'] });
      queryClient.invalidateQueries({ queryKey: ['clientNames'] }); 
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); // Invalida ordens para garantir que as contagens sejam atualizadas
    },
  });

  return {
    client: clientWithCounts,
    isLoading: isLoadingClientDetails,
    updateClient: updateClientMutation,
    deleteClient: deleteClientMutation,
  };
};

// Hook para buscar apenas nomes de clientes (para seletores)
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
        .order('name', { ascending: true }); // Ordenar por nome alfabeticamente

      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user?.id,
  });
};