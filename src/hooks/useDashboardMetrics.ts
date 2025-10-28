import { useMemo } from "react";
import { useServiceOrders, ServiceOrder } from "./useServiceOrders";
import { statusChartColors, ServiceOrderStatus } from "@/lib/serviceOrderStatus";

export const useDashboardMetrics = () => {
  const { orders, isLoading } = useServiceOrders();

  const metrics = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        activeOrders: 0,
        completedLast30Days: 0,
        statusDistribution: [],
        revenue: { current: 0, previous: 0, change: 0 },
        ordersByStore: [],
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    const activeOrders = orders.filter(
      (order) => order.status !== "CONCLUÍDA" && order.status !== "CANCELADA"
    ).length;

    const completedLast30Days = orders.filter(
      (order) =>
        order.status === "CONCLUÍDA" && new Date(order.updated_at) > thirtyDaysAgo
    ).length;

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<ServiceOrderStatus, number>);

    const statusDistribution = Object.entries(statusCounts).map(
      ([status, count]) => ({
        name: status,
        value: count,
        color: statusChartColors[status as ServiceOrderStatus],
      })
    );

    const storeCounts = orders.reduce((acc, order) => {
        acc[order.store] = (acc[order.store] || 0) + 1;
        return acc;
    }, {} as Record<ServiceOrder['store'], number>);

    const ordersByStore = Object.entries(storeCounts).map(([name, value]) => ({
        name, value
    }));


    return {
      totalOrders: orders.length,
      activeOrders,
      completedLast30Days,
      statusDistribution,
      revenue: { current: 1250, previous: 980, change: 27.5 }, // Placeholder
      ordersByStore,
    };
  }, [orders]);

  return { metrics, isLoading };
};