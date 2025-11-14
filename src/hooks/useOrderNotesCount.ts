import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

const fetchNotesCount = async (orderId: string): Promise<number> => {
  const { data, error, count } = await supabase
    .from('service_order_notes')
    .select('id', { count: 'exact', head: true })
    .eq('service_order_id', orderId);

  if (error) throw error;

  return count || 0;
};

export const useOrderNotesCount = (orderId: string) => {
  const { user } = useSession();

  return useQuery<number, Error>({
    queryKey: ['serviceOrderNotesCount', orderId],
    queryFn: () => fetchNotesCount(orderId),
    enabled: !!orderId && !!user?.id,
  });
};