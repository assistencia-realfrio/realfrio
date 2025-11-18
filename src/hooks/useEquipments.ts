import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { logActivity } from "@/utils/activityLogger";

export interface Equipment {
  id: string;
  client_id: string;
  name: string;
  brand: string | null; // Novo campo
  model: string | null;
  serial_number: string | null;
  created_at: string;
  establishment_id: string | null; // NOVO
  establishment_name: string | null; // NOVO (do join)
}

export interface EquipmentFormValues {
  client_id: string;
  name: string;
  brand?: string; // Novo campo
  model?: string;
  serial_number?: string;
  establishment_id?: string | null; // NOVO
}

// Função de fetch para buscar equipamentos por cliente
const fetchEquipmentsByClient = async (userId: string | undefined, clientId: string): Promise<Equipment[]> => {
  // No longer checking for userId here, as RLS handles authentication.
  // If userId is truly needed for some other logic, it should be handled differently.
  
  const { data, error } = await supabase
    .from('equipments')
    .select(`
      id, client_id, name, brand, model, serial_number, created_at, establishment_id,
      client_establishments (name)
    `) // Adicionado establishment_id e join
    // .eq('created_by', userId) // REMOVIDO: Filtro por created_by
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((eq: any) => ({
    ...eq,
    establishment_name: eq.client_establishments?.name || null,
  })) as Equipment[];
};

// Função para buscar um único equipamento por ID
const fetchEquipmentById = async (userId: string | undefined, equipmentId: string): Promise<Equipment | null> => {
  // No longer checking for userId here, as RLS handles authentication.
  // If userId is truly needed for some other logic, it should be handled differently.

  const { data, error } = await supabase
    .from('equipments')
    .select(`
      id, client_id, name, brand, model, serial_number, created_at, establishment_id,
      client_establishments (name)
    `) // Adicionado establishment_id e join
    // .eq('created_by', userId) // REMOVIDO: Filtro por created_by
    .eq('id', equipmentId)
    .single(); // Usa .single() para obter um único registro

  if (error && error.code === 'PGRST116') { // PGRST116 significa que nenhuma linha foi encontrada
    return null;
  }
  if (error) {
    throw error;
  }

  return {
    ...(data as any),
    establishment_name: (data as any).client_establishments?.name || null,
  } as Equipment;
};

export const useEquipments = (clientId?: string, equipmentId?: string) => { // clientId agora é opcional, equipmentId adicionado
  const { user } = useSession();
  const queryClient = useQueryClient();

  // Query para a lista de equipamentos de um cliente (usado no seletor)
  const { data: equipments = [], isLoading: isLoadingEquipmentsList } = useQuery<Equipment[], Error>({
    queryKey: ['equipments', clientId, user?.id],
    queryFn: () => fetchEquipmentsByClient(user?.id, clientId!),
    enabled: !!user?.id && !!clientId, // Habilita apenas se clientId for fornecido
  });

  // Query para um único equipamento por ID (usado para carregar dados iniciais na edição)
  const { data: singleEquipment, isLoading: isLoadingSingleEquipment } = useQuery<Equipment | null, Error>({
    queryKey: ['equipment', equipmentId, user?.id],
    queryFn: () => fetchEquipmentById(user?.id, equipmentId!),
    enabled: !!user?.id && !!equipmentId, // Habilita apenas se equipmentId for fornecido
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (equipmentData: EquipmentFormValues) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from('equipments')
        .insert({
          client_id: equipmentData.client_id,
          name: equipmentData.name,
          brand: equipmentData.brand || null, // Salvando a marca
          model: equipmentData.model || null,
          serial_number: equipmentData.serial_number || null,
          establishment_id: equipmentData.establishment_id || null, // NOVO: Salvando establishment_id
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Equipment;
    },
    onSuccess: (newEquipment) => {
      logActivity(user, {
        entity_type: 'equipment',
        entity_id: newEquipment.id,
        action_type: 'created',
        content: `Equipamento "${newEquipment.name}" foi criado.`
      });
      queryClient.invalidateQueries({ queryKey: ['equipments', newEquipment.client_id] });
      queryClient.invalidateQueries({ queryKey: ['equipment', newEquipment.id] });
      queryClient.invalidateQueries({ queryKey: ['allEquipments'] }); // Invalidate allEquipments to reflect new entry
    },
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ id, ...equipmentData }: EquipmentFormValues & { id: string }) => {
      console.log("[updateEquipmentMutation] Payload enviado:", { id, ...equipmentData }); // LOG DE DEBUG
      
      const { data, error } = await supabase
        .from('equipments')
        .update({
          name: equipmentData.name,
          brand: equipmentData.brand || null,
          model: equipmentData.model || null,
          serial_number: equipmentData.serial_number || null,
          establishment_id: equipmentData.establishment_id || null, // NOVO: Atualizando establishment_id
          updated_at: new Date().toISOString(), // Adiciona updated_at
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("[updateEquipmentMutation] Erro do Supabase:", error); // LOG DE ERRO
        throw error;
      }
      
      console.log("[updateEquipmentMutation] Resposta do Supabase:", data); // LOG DE SUCESSO
      return data as Equipment;
    },
    onSuccess: (updatedEquipment) => {
      const equipmentName = updatedEquipment.name;
      
      logActivity(user, {
        entity_type: 'equipment',
        entity_id: updatedEquipment.id,
        action_type: 'updated',
        content: `Equipamento "${equipmentName}" foi atualizado.`
      });
      
      queryClient.invalidateQueries({ queryKey: ['equipments', updatedEquipment.client_id] });
      queryClient.invalidateQueries({ queryKey: ['equipment', updatedEquipment.id] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['allEquipments'] }); // Invalidate allEquipments to reflect changes
    },
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: async (equipmentId: string) => {
      const equipmentToDelete = queryClient.getQueryData<Equipment | null>(['equipment', equipmentId, user?.id]);
      
      const { error } = await supabase
        .from('equipments')
        .delete()
        .eq('id', equipmentId);

      if (error) throw error;
      return { equipmentToDelete };
    },
    onSuccess: ({ equipmentToDelete }) => {
      if (equipmentToDelete) {
        logActivity(user, {
          entity_type: 'equipment',
          entity_id: equipmentToDelete.id,
          action_type: 'deleted',
          content: `Equipamento "${equipmentToDelete.name}" foi excluído.`
        });
      }
      queryClient.invalidateQueries({ queryKey: ['equipments', clientId] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['allEquipments'] }); // Invalidate allEquipments to reflect deletion
    },
  });

  return {
    equipments,
    singleEquipment,
    isLoading: isLoadingEquipmentsList || isLoadingSingleEquipment,
    createEquipment: createEquipmentMutation,
    updateEquipment: updateEquipmentMutation,
    deleteEquipment: deleteEquipmentMutation,
  };
};