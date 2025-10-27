import { useMemo } from "react";
import { useServiceOrders, ServiceOrder } from "./useServiceOrders";

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface DashboardMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  statusChartData: StatusData[];
  isLoading: boolean;
}

const STATUS_COLORS: Record<ServiceOrder['status'], string> = {
  'Pendente': 'hsl(var(--destructive))',
  'Em Progresso': 'hsl(var(--secondary))',
  'Concluída': 'hsl(var(--primary))',
  'Cancelada': 'hsl(var(--muted-foreground))',
};

export const useDashboardMetrics = (): DashboardMetrics => {
  const { orders, isLoading } = useServiceOrders();

  const metrics = useMemo(() => {
    if (isLoading) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        statusCounts: {} as Record<ServiceOrder['status'], number>,
      };
    }

    const totalOrders = orders.length;
    let pendingOrders = 0;
    let completedOrders = 0;
    const statusCounts: Record<ServiceOrder['status'], number> = {
      'Pendente': 0,
      'Em Progresso': 0,
      'Concluída': 0,
      'Cancelada': 0,
    };

    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      
      if (order.status === 'Pendente') {
        pendingOrders++;
      }
      if (order.status === 'Concluída') {
        completedOrders++;
      }
    });

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      statusCounts,
    };
  }, [orders, isLoading]);

  const statusChartData: StatusData[] = useMemo(() => {
    return Object.entries(metrics.statusCounts)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({
        name: status,
        value: value,
        color: STATUS_COLORS[status as ServiceOrder['status']],
      }));
  }, [metrics.statusCounts]);

  return {
    totalOrders: metrics.totalOrders,
    pendingOrders: metrics.pendingOrders,
    completedOrders: metrics.completedOrders,
    statusChartData,
    isLoading,
  };
};