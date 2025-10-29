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
}

export interface EquipmentFormValues {
  client_id: string;
  name: string;
  brand?: string; // Novo campo
  model?: string;
  serial_number?: string;
}

// Função de fetch para buscar equipamentos por cliente
const fetchEquipmentsByClient = async (userId: string | undefined, clientId: string): Promise<Equipment[]> => {
  if (!userId || !clientId) return [];
  
  const { data, error } = await supabase
    .from('equipments')
    .select('*')
    .eq('created_by', userId)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data as Equipment[];
};

// Função para buscar um único equipamento por ID
const fetchEquipmentById = async (userId: string | undefined, equipmentId: string): Promise<Equipment | null> => {
  if (!userId || !equipmentId) return null;

  const { data, error } = await supabase
    .from('equipments')
    .select('*')
    .eq('created_by', userId)
    .eq('id', equipmentId)
    .single(); // Usa .single() para obter um único registro

  if (error && error.code === 'PGRST116') { // PGRST116 significa que nenhuma linha foi encontrada
    return null;
  }
  if (error) {
    throw error;
  }

  return data as Equipment;
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
    },
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ id, ...equipmentData }: EquipmentFormValues & { id: string }) => {
      const { data, error } = await supabase
        .from('equipments')
        .update({
          name: equipmentData.name,
          brand: equipmentData.brand || null,
          model: equipmentData.model || null,
          serial_number: equipmentData.serial_number || null,
          updated_at: new Date().toISOString(), // Adiciona updated_at
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Equipment;
    },
    onSuccess: (updatedEquipment) => {
      logActivity(user, {
        entity_type: 'equipment',
        entity_id: updatedEquipment.id,
        action_type: 'updated',
        content: `Equipamento "${updatedEquipment.name}" foi atualizado.`
      });
      queryClient.invalidateQueries({ queryKey: ['equipments', updatedEquipment.client_id] });
      queryClient.invalidateQueries({ queryKey: ['equipment', updatedEquipment.id] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
    },
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: async (equipmentId: string) => {
      const equipmentToDelete = queryClient.getQueryData<Equipment>(['equipment', equipmentId, user?.id]);
      
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