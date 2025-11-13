import { useMemo } from "react";
import { useServiceOrders, ServiceOrder, ServiceOrderStatus, serviceOrderStatuses } from "./useServiceOrders"; // Import from refactored hook
import { statusChartColors } from "@/lib/serviceOrderStatus";

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

export const useDashboardMetrics = (storeFilter: ServiceOrder['store'] | 'ALL' = 'ALL'): DashboardMetrics => {
  const { orders, isLoading } = useServiceOrders(undefined, storeFilter); // Pass storeFilter to useServiceOrders

  const metrics = useMemo(() => {
    if (isLoading) {
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
  }, [orders, isLoading]);

  const statusChartData: StatusData[] = useMemo(() => {
    return Object.entries(metrics.statusCounts)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({
        name: status,
        value: value as number, // Cast to number as it's guaranteed by filter
        color: statusChartColors[status as ServiceOrderStatus],
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