import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchServiceOrderAttachmentsCount = async (orderId: string): Promise<number> => {
  const bucketName = 'order_attachments';
  const folderPath = `${orderId}`;

  try {
    const { data, error } = await supabase.storage.from(bucketName).list(folderPath, {
      limit: 100, // Limite para a quantidade de arquivos a listar
      offset: 0,
    });

    if (error) throw error;
    return data?.length || 0;
  } catch (error) {
    console.error("Erro ao buscar contagem de anexos:", error);
    return 0;
  }
};

export const useServiceOrderAttachmentsCount = (orderId: string) => {
  return useQuery<number, Error>({
    queryKey: ['serviceOrderAttachmentsCount', orderId],
    queryFn: () => fetchServiceOrderAttachmentsCount(orderId),
    enabled: !!orderId,
  });
};