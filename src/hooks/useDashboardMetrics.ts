import { useMemo } from "react";
import { useServiceOrders, ServiceOrder } from "./useServiceOrders";
import { statusChartColors, ServiceOrderStatus } from "@/lib/serviceOrderStatus";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { useQuery } from "@tanstack/react-query";

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface DashboardMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalTimeRegistered: string; // Alterado para string para exibir formatado
  statusChartData: StatusData[];
  isLoading: boolean;
}

// Função para buscar o tempo total registrado
const fetchTotalTimeRegistered = async (userId: string | undefined, storeFilter: ServiceOrder['store'] | 'ALL'): Promise<number> => {
  if (!userId) return 0;

  let serviceOrderIds: string[] = [];
  if (storeFilter !== 'ALL') {
    // Primeiro, buscamos os IDs das ordens de serviço que correspondem ao filtro de loja
    const { data: ordersData, error: ordersError } = await supabase
      .from('service_orders')
      .select('id')
      .eq('store', storeFilter);

    if (ordersError) {
      console.error("Erro ao buscar IDs de ordens de serviço para filtro de loja:", ordersError);
      throw ordersError;
    }
    serviceOrderIds = ordersData.map(order => order.id);
    
    // Se não houver ordens de serviço para o filtro, não há tempo para registrar
    if (serviceOrderIds.length === 0) {
      return 0;
    }
  }

  let query = supabase
    .from('time_entries')
    .select('duration_minutes');

  // Filtra por user_id (apenas as entradas do utilizador logado)
  query = query.eq('user_id', userId);

  // Se houver filtro de loja, aplicamos o filtro de IDs obtidos
  if (storeFilter !== 'ALL') {
    query = query.in('service_order_id', serviceOrderIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar tempo total registrado:", error);
    throw error;
  }

  return data.reduce((sum, entry) => sum + entry.duration_minutes, 0);
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}min` : ''}`.trim();
};

export const useDashboardMetrics = (storeFilter: ServiceOrder['store'] | 'ALL' = 'ALL'): DashboardMetrics => {
  const { user } = useSession();
  const { orders, isLoading: isLoadingOrders } = useServiceOrders(undefined, storeFilter);

  const { data: totalMinutesRegistered = 0, isLoading: isLoadingTime } = useQuery<number, Error>({
    queryKey: ['dashboardMetrics', 'totalTimeRegistered', user?.id, storeFilter],
    queryFn: () => fetchTotalTimeRegistered(user?.id, storeFilter),
    enabled: !!user?.id,
  });

  const metrics = useMemo(() => {
    if (isLoadingOrders) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        statusCounts: {} as Record<ServiceOrderStatus, number>,
      };
    }

    const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {} as Record<ServiceOrderStatus, number>);

    return {
      totalOrders: orders.length,
      pendingOrders: statusCounts['POR INICIAR'] || 0,
      completedOrders: statusCounts['CONCLUIDA'] || 0,
      statusCounts,
    };
  }, [orders, isLoadingOrders]);

  const statusChartData: StatusData[] = useMemo(() => {
    return Object.entries(metrics.statusCounts)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({
        name: status,
        value: value,
        color: statusChartColors[status as ServiceOrderStatus],
      }));
  }, [metrics.statusCounts]);

  return {
    totalOrders: metrics.totalOrders,
    pendingOrders: metrics.pendingOrders,
    completedOrders: metrics.completedOrders,
    totalTimeRegistered: formatDuration(totalMinutesRegistered),
    statusChartData,
    isLoading: isLoadingOrders || isLoadingTime,
  };
};