import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchServiceOrderNotesCount = async (orderId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('service_order_notes')
    .select('*', { count: 'exact', head: true })
    .eq('service_order_id', orderId);

  if (error) throw error;
  return count || 0;
};

export const useServiceOrderNotesCount = (orderId: string) => {
  return useQuery<number, Error>({
    queryKey: ['serviceOrderNotesCount', orderId],
    queryFn: () => fetchServiceOrderNotesCount(orderId),
    enabled: !!orderId,
  });
};