import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

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
      // Invalida a query de equipamentos para o cliente atual
      queryClient.invalidateQueries({ queryKey: ['equipments', newEquipment.client_id] });
      // Invalida a query do equipamento único se for o caso
      queryClient.invalidateQueries({ queryKey: ['equipment', newEquipment.id] });
    },
  });

  return {
    equipments,
    singleEquipment, // Expondo o equipamento único
    isLoading: isLoadingEquipmentsList || isLoadingSingleEquipment, // Estado de carregamento combinado
    createEquipment: createEquipmentMutation,
  };
};