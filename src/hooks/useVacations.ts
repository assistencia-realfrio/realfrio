import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { logActivity } from "@/utils/activityLogger";
import { format, eachDayOfInterval, isWeekend } from "date-fns"; // Adicionado eachDayOfInterval, isWeekend
import { showError } from "@/utils/toast";

export type VacationStatus = 'pending' | 'approved' | 'rejected';

export interface Vacation {
  id: string;
  user_id: string;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  status: VacationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_full_name: string; // From profiles join
  user_initials: string; // Iniciais do utilizador
  working_days_count: number; // NOVO: Contagem de dias úteis
}

export interface VacationFormValues {
  start_date: Date;
  end_date: Date;
  notes?: string;
}

export interface CreateVacationPayload {
  user_id?: string; // NOVO: user_id opcional para permitir criar férias para outros
  start_date: string; // ISO string
  end_date: string;   // ISO string
  notes?: string;
}

export interface UpdateVacationPayload {
  id: string;
  start_date?: string; // ISO string
  end_date?: string;   // ISO string
  notes?: string;
}

// Helper function to calculate working days
const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(day => !isWeekend(day)).length;
};

const fetchVacations = async (): Promise<Vacation[]> => {
  const { data, error } = await supabase
    .from('vacations')
    .select(`
      *,
      profiles (first_name, last_name)
    `)
    .order('start_date', { ascending: true });

  if (error) throw error;

  return data.map((vacation: any) => {
    const firstName = vacation.profiles?.first_name || '';
    const lastName = vacation.profiles?.last_name || '';
    const userFullName = `${firstName} ${lastName}`.trim() || 'Usuário Desconhecido';
    const userInitials = ((firstName.charAt(0) || '') + (lastName.charAt(0) || '')).toUpperCase();

    const startDateObj = new Date(vacation.start_date);
    const endDateObj = new Date(vacation.end_date);
    const workingDays = calculateWorkingDays(startDateObj, endDateObj); // Calculate working days

    return {
      id: vacation.id,
      user_id: vacation.user_id,
      start_date: vacation.start_date,
      end_date: vacation.end_date,
      status: vacation.status as VacationStatus,
      notes: vacation.notes,
      created_at: vacation.created_at,
      updated_at: vacation.updated_at,
      user_full_name: userFullName,
      user_initials: userInitials,
      working_days_count: workingDays, // Assign calculated value
    };
  });
};

export const useVacations = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: vacations = [], isLoading, error } = useQuery<Vacation[], Error>({
    queryKey: ['vacations'],
    queryFn: () => fetchVacations(),
    enabled: !!user?.id,
  });

  const createVacationMutation = useMutation({
    mutationFn: async (payload: CreateVacationPayload) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const userIdToInsert = payload.user_id || user.id; // Usa o user_id fornecido ou o do utilizador atual

      const { data, error } = await supabase
        .from('vacations')
        .insert({
          user_id: userIdToInsert, // Usa o ID do utilizador determinado
          start_date: payload.start_date,
          end_date: payload.end_date,
          notes: payload.notes,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Vacation;
    },
    onSuccess: (newVacation) => {
      logActivity(user, {
        entity_type: 'profile',
        entity_id: newVacation.user_id || '', // Loga para o utilizador da solicitação
        action_type: 'created',
        content: `Solicitou férias de ${format(new Date(newVacation.start_date), 'dd/MM/yyyy')} a ${format(new Date(newVacation.end_date), 'dd/MM/yyyy')}.`,
        details: { vacationId: newVacation.id, status: newVacation.status, requestedBy: user?.email }
      });
      queryClient.invalidateQueries({ queryKey: ['vacations'] });
    },
  });

  const updateVacationMutation = useMutation({
    mutationFn: async (payload: UpdateVacationPayload) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const { id, ...updateData } = payload;
      
      const { data, error } = await supabase
        .from('vacations')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id) // Mantém a restrição de que só o próprio utilizador pode atualizar
        .select()
        .single();

      if (error) throw error;
      return data as Vacation;
    },
    onSuccess: (updatedVacation) => {
      logActivity(user, {
        entity_type: 'profile',
        entity_id: updatedVacation.user_id || '',
        action_type: 'updated',
        content: `Atualizou pedido de férias (ID: ${updatedVacation.id}).`,
        details: { 
          vacationId: updatedVacation.id, 
          startDate: updatedVacation.start_date, 
          endDate: updatedVacation.end_date, 
          status: updatedVacation.status 
        }
      });
      queryClient.invalidateQueries({ queryKey: ['vacations'] });
    },
  });

  const deleteVacationMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const { error } = await supabase
        .from('vacations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Mantém a restrição de que só o próprio utilizador pode excluir

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      logActivity(user, {
        entity_type: 'profile',
        entity_id: user?.id || '',
        action_type: 'deleted',
        content: `Removeu pedido de férias (ID: ${deletedId}).`,
        details: { vacationId: deletedId }
      });
      queryClient.invalidateQueries({ queryKey: ['vacations'] });
    },
  });

  return {
    vacations,
    isLoading,
    error,
    createVacation: createVacationMutation,
    updateVacation: updateVacationMutation,
    deleteVacation: deleteVacationMutation,
  };
};