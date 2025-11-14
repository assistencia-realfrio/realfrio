import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

const BUCKET_NAME = 'order_attachments';

const fetchAttachmentsCount = async (orderId: string): Promise<number> => {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(orderId, {
    limit: 100,
    offset: 0,
  });

  if (error) {
    // Se a pasta não existir, o Supabase Storage pode retornar um erro 404 ou uma lista vazia.
    // Tratamos o erro como 0 anexos para evitar falhas na UI.
    if (error.message.includes('The specified key does not exist')) {
        return 0;
    }
    throw error;
  }

  // Filtra para garantir que apenas arquivos sejam contados (e não subdiretórios, se houver)
  return data?.filter(file => file.id !== null).length || 0;
};

export const useOrderAttachmentsCount = (orderId: string) => {
  const { user } = useSession();

  return useQuery<number, Error>({
    queryKey: ['orderAttachmentsCount', orderId],
    queryFn: () => fetchAttachmentsCount(orderId),
    enabled: !!orderId && !!user?.id,
    // Refetch a cada 30 segundos para manter a contagem atualizada
    refetchInterval: 30000, 
  });
};