import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Equipment } from "./useEquipments";

export interface EquipmentWithClient extends Equipment {
  client_name: string;
}

const fetchAllEquipments = async (userId: string | undefined): Promise<EquipmentWithClient[]> => {
  // No longer checking for userId here, as RLS handles authentication.
  // If userId is truly needed for some other logic, it should be handled differently.
  
  const { data, error } = await supabase
    .from('equipments')
    .select('*, clients (name)')
    // .eq('created_by', userId) // REMOVIDO: Filtro por created_by
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((eq: any) => ({
      ...eq,
      client_name: eq.clients?.name || 'Cliente Desconhecido'
  })) as EquipmentWithClient[];
};

export const useAllEquipments = (searchTerm: string = "") => {
    const { user } = useSession();

    const { data: equipments = [], isLoading } = useQuery<EquipmentWithClient[], Error>({
        queryKey: ['allEquipments', user?.id],
        queryFn: () => fetchAllEquipments(user?.id),
        enabled: !!user?.id, // Still enable only if user is logged in
    });

    const filteredEquipments = equipments.filter(equipment => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        return (
            equipment.name.toLowerCase().includes(lowerCaseSearch) ||
            (equipment.brand && equipment.brand.toLowerCase().includes(lowerCaseSearch)) ||
            (equipment.model && equipment.model.toLowerCase().includes(lowerCaseSearch)) ||
            (equipment.serial_number && equipment.serial_number.toLowerCase().includes(lowerCaseSearch)) ||
            equipment.client_name.toLowerCase().includes(lowerCaseSearch)
        );
    });

    return {
        equipments: filteredEquipments,
        isLoading,
    };
}