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
  billing_name: string | null; // NOVO: Campo para nome de faturação
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
  // No longer checking for userId here, as RLS handles authentication.
  // If userId is truly needed for some other logic, it should be handled differently.
  
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, billing_name, contact, email, status, created_at, store, maps_link, locality, google_drive_link') // Adicionando 'billing_name'
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
    billing_name: client.billing_name || null, // Garante que billing_name seja string ou null
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
      client.billing_name?.toLowerCase().includes(lowerCaseSearch) || // NOVO: Busca por nome de faturação
      client.contact?.toLowerCase().includes(lowerCaseSearch) || // Adicionado '?' para contact
      client.email?.toLowerCase().includes(lowerCaseSearch) || // Adicionado '?' para email
      client.locality?.toLowerCase().includes(lowerCaseSearch) // NOVO: Busca por localidade
    );
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: ClientFormValues) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          billing_name: clientData.billing_name, // NOVO: Inserindo billing_name
          contact: clientData.contact, // Usando o valor transformado pelo Zod
          email: clientData.email,     // Usando o valor transformado pelo Zod
          created_by: user.id,
          status: 'Ativo', // Default status
          store: clientData.store,
          maps_link: clientData.maps_link, // Usando o valor transformado pelo Zod
          locality: clientData.locality, // Usando o valor transformado pelo Zod
          google_drive_link: clientData.google_drive_link, // NOVO: Adicionando google_drive_link
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
        content: `Cliente "${newClient.name}" foi criado.`
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientNames'] }); 
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); 
      queryClient.invalidateQueries({ queryKey: ['allEstablishments'] }); // Invalida estabelecimentos para atualizar nomes de clientes
      queryClient.invalidateQueries({ queryKey: ['allEquipments'] }); // Invalida equipamentos para atualizar nomes de clientes
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...clientData }: ClientFormValues & { id: string }) => {
      // Busca o cliente antigo para o log
      const oldClient = queryClient.getQueryData<Client[]>(['clients', user?.id])?.find(c => c.id === id);

      const { data, error } = await supabase
        .from('clients')
        .update({
          name: clientData.name,
          billing_name: clientData.billing_name, // NOVO: Atualizando billing_name
          contact: clientData.contact,
          email: clientData.email,
          store: clientData.store,
          maps_link: clientData.maps_link, // Usando maps_link
          locality: clientData.locality, // Usando locality
          google_drive_link: clientData.google_drive_link, // NOVO: Atualizando google_drive_link
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Erro do Supabase na atualização do cliente:", error);
        throw error;
      }
      return { updatedClient: data as Client, oldClient };
    },
    onSuccess: ({ updatedClient, oldClient }) => {
      const changes: Record<string, { oldValue?: any; newValue?: any }> = {};

      // Comparar e registrar alterações
      if (oldClient?.name !== updatedClient.name) {
        changes.name = { oldValue: oldClient?.name, newValue: updatedClient.name };
      }
      if (oldClient?.billing_name !== updatedClient.billing_name) {
        changes.billing_name = { oldValue: oldClient?.billing_name, newValue: updatedClient.billing_name };
      }
      if (oldClient?.contact !== updatedClient.contact) {
        changes.contact = { oldValue: oldClient?.contact, newValue: updatedClient.contact };
      }
      if (oldClient?.email !== updatedClient.email) {
        changes.email = { oldValue: oldClient?.email, newValue: updatedClient.email };
      }
      if (oldClient?.store !== updatedClient.store) {
        changes.store = { oldValue: oldClient?.store, newValue: updatedClient.store };
      }
      if (oldClient?.maps_link !== updatedClient.maps_link) {
        changes.maps_link = { oldValue: oldClient?.maps_link, newValue: updatedClient.maps_link };
      }
      if (oldClient?.locality !== updatedClient.locality) {
        changes.locality = { oldValue: oldClient?.locality, newValue: updatedClient.locality };
      }
      if (oldClient?.google_drive_link !== updatedClient.google_drive_link) {
        changes.google_drive_link = { oldValue: oldClient?.google_drive_link, newValue: updatedClient.google_drive_link };
      }

      const clientName = updatedClient.name;
      const content = oldClient?.name && oldClient.name !== clientName 
        ? `Cliente "${oldClient.name}" foi renomeado para "${clientName}" e atualizado.`
        : `Cliente "${clientName}" foi atualizado.`;

      logActivity(user, {
        entity_type: 'client',
        entity_id: updatedClient.id,
        action_type: 'updated',
        content: content,
        details: changes, // Passar os detalhes das alterações
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientNames'] }); 
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); 
      queryClient.invalidateQueries({ queryKey: ['allEstablishments'] }); // Invalida estabelecimentos para atualizar nomes de clientes
      queryClient.invalidateQueries({ queryKey: ['allEquipments'] }); // Invalida equipamentos para atualizar nomes de clientes
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
          content: `Cliente "${clientToDelete.name}" foi excluído.`
        });
      }
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientNames'] }); 
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['allEstablishments'] }); // Invalida estabelecimentos para remover os do cliente excluído
      queryClient.invalidateQueries({ queryKey: ['allEquipments'] }); // Invalida equipamentos para remover os do cliente excluído
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