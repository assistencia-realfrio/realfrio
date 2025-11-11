import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { ClientFormValues } from "@/components/ClientForm";
import { useServiceOrders } from "./useServiceOrders"; // Importando o hook de OS
import { isActiveStatus } from "@/lib/serviceOrderStatus";
import { logActivity } from "@/utils/activityLogger";

export interface Client {
  id: string;
  name: string;
  contact: string | null; // Pode ser string ou null
  email: string | null; // Pode ser string ou null
  status: "Ativo" | "Inativo";
  totalOrders: number; // Este campo será calculado no frontend
  openOrders: number; // NOVO: Campo para OS em aberto
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS" | null; // NOVO: Campo para a loja associada
  maps_link: string | null; // NOVO: Campo para o link do mapa
  locality: string | null; // NOVO: Campo para a localidade
  google_drive_link: string | null; // NOVO: Campo para o link do Google Drive
}

// Função de fetch para buscar TODOS os clientes (para a lista)
const fetchClients = async (userId: string | undefined): Promise<Client[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, contact, email, status, created_at, store, maps_link, locality, google_drive_link') // Adicionando 'google_drive_link'
    // .eq('created_by', userId) // REMOVIDO: Filtro por created_by
    .order('name', { ascending: true }); // Ordenar por nome alfabeticamente

  if (error) throw error;

  // Retorna os dados brutos do cliente, sem o totalOrders e openOrders ainda
  return data.map(client => ({
    ...client,
    totalOrders: 0, // Inicializa com 0
    openOrders: 0, // Inicializa com 0
    status: client.status as "Ativo" | "Inativo",
    store: client.store as "CALDAS DA RAINHA" | "PORTO DE MÓS" | null, // Tipagem para o campo 'store'
    maps_link: client.maps_link || null, // Garante que maps_link seja string ou null
    locality: client.locality || null, // Garante que locality seja string ou null
    google_drive_link: client.google_drive_link || null, // Garante que google_drive_link seja string ou null
  })) as Client[];
};

// Hook principal para clientes (lista, criação, atualização, exclusão)
export const useClients = (searchTerm: string = "", storeFilter: "ALL" | Client['store'] | null = "ALL") => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { orders } = useServiceOrders(); // Obtém todas as ordens de serviço

  const { data: rawClients = [], isLoading: isLoadingClients } = useQuery<Client[], Error>({
    queryKey: ['clients', user?.id],
    queryFn: () => fetchClients(user?.id),
    enabled: !!user?.id,
  });

  // 1. Calcular a contagem de OS por cliente (total e em aberto)
  const clientsWithCounts = rawClients.map(client => {
    const clientOrders = orders.filter(order => order.client_id === client.id);
    const totalOrders = clientOrders.length;
    const openOrders = clientOrders.filter(order => isActiveStatus(order.status)).length;
    return { ...client, totalOrders, openOrders };
  });

  // 2. Filtrar por loja primeiro
  const filteredByStore = storeFilter === "ALL"
    ? clientsWithCounts
    : clientsWithCounts.filter(client => client.store === storeFilter);

  // 3. Em seguida, filtrar por termo de busca
  const filteredClients = filteredByStore.filter(client => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(lowerCaseSearch) ||
      client.contact?.toLowerCase().includes(lowerCaseSearch) || // Adicionado '?' para contact
      client.email?.toLowerCase().includes(lowerCaseSearch) || // Adicionado '?' para email
      client.locality?.toLowerCase().includes(lowerCaseSearch) // NOVO: Busca por localidade
    );
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: ClientFormValues) => {
      if (!user?.id) throw new Error("USUÁRIO NÃO AUTENTICADO.");
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: clientData.name.toUpperCase(),
          contact: clientData.contact?.toUpperCase() || null,
          email: clientData.email?.toUpperCase() || null,
          created_by: user.id,
          status: 'ATIVO', // Default status
          store: clientData.store,
          maps_link: clientData.maps_link?.toUpperCase() || null,
          locality: clientData.locality?.toUpperCase() || null,
          google_drive_link: clientData.google_drive_link?.toUpperCase() || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Erro do Supabase na criação do cliente:", error); // Log do erro do Supabase
        throw error;
      }
      return data as Client;
    },
    onSuccess: (newClient) => {
      logActivity(user, {
        entity_type: 'client',
        entity_id: newClient.id,
        action_type: 'created',
        content: `CLIENTE "${newClient.name}" FOI CRIADO.`
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientNames'] }); 
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); 
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...clientData }: ClientFormValues & { id: string }) => {
      // Busca o nome antigo para o log
      const oldClient = queryClient.getQueryData<Client[]>(['clients', user?.id])?.find(c => c.id === id);

      const { data, error } = await supabase
        .from('clients')
        .update({
          name: clientData.name.toUpperCase(),
          contact: clientData.contact?.toUpperCase() || null,
          email: clientData.email?.toUpperCase() || null,
          store: clientData.store,
          maps_link: clientData.maps_link?.toUpperCase() || null,
          locality: clientData.locality?.toUpperCase() || null,
          google_drive_link: clientData.google_drive_link?.toUpperCase() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Erro do Supabase na atualização do cliente:", error);
        throw error;
      }
      return { updatedClient: data as Client, oldClientName: oldClient?.name };
    },
    onSuccess: ({ updatedClient, oldClientName }) => {
      const clientName = updatedClient.name;
      const content = oldClientName && oldClientName !== clientName 
        ? `CLIENTE "${oldClientName}" FOI RENOMEADO PARA "${clientName}" E ATUALIZADO.`
        : `CLIENTE "${clientName}" FOI ATUALIZADO.`;

      logActivity(user, {
        entity_type: 'client',
        entity_id: updatedClient.id,
        action_type: 'updated',
        content: content
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientNames'] }); 
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); 
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const clients = queryClient.getQueryData<Client[]>(['clients', user?.id]);
      const clientToDelete = clients?.find(c => c.id === id);

      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      
      return { clientToDelete };
    },
    onSuccess: ({ clientToDelete }) => {
      if (clientToDelete) {
        logActivity(user, {
          entity_type: 'client',
          entity_id: clientToDelete.id,
          action_type: 'deleted',
          content: `CLIENTE "${clientToDelete.name}" FOI EXCLUÍDO.`
        });
      }
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientNames'] }); 
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
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

// Hook para buscar apenas nomes de clientes (para seletores) - Mantido separado para simplicidade
export const useClientNames = () => {
  const { user } = useSession();
  return useQuery<Client[], Error>({
    queryKey: ['clientNames', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        // .eq('created_by', user.id) // REMOVIDO: Filtro por created_by
        .order('name', { ascending: true }); // Ordenar por nome alfabeticamente

      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user?.id,
  });
};