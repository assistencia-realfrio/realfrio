import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

export interface Equipment {
  id: string;
  client_id: string;
  name: string;
  model: string | null;
  serial_number: string | null;
  created_at: string;
}

export interface EquipmentFormValues {
  client_id: string;
  name: string;
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

export const useEquipments = (clientId: string) => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: equipments = [], isLoading } = useQuery<Equipment[], Error>({
    queryKey: ['equipments', clientId, user?.id],
    queryFn: () => fetchEquipmentsByClient(user?.id, clientId),
    enabled: !!user?.id && !!clientId,
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (equipmentData: EquipmentFormValues) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from('equipments')
        .insert({
          client_id: equipmentData.client_id,
          name: equipmentData.name,
          model: equipmentData.model || null,
          serial_number: equipmentData.serial_number || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Equipment;
    },
    onSuccess: () => {
      // Invalida a query de equipamentos para o cliente atual
      queryClient.invalidateQueries({ queryKey: ['equipments', clientId] });
    },
  });

  return {
    equipments,
    isLoading,
    createEquipment: createEquipmentMutation,
  };
};