import React, { useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServiceOrders } from "@/hooks/useServiceOrders";
import { parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import OrderListItem from "@/components/OrderListItem";
import { Skeleton } from "@/components/ui/skeleton";

const CalendarView: React.FC = () => {
  const { orders, isLoading } = useServiceOrders();

  const scheduledOrders = useMemo(() => {
    // 1. Filtrar apenas ordens com data agendada
    const filtered = orders.filter(order => order.scheduled_date);

    // 2. Ordenar pela data de agendamento mais próxima (ascendente)
    filtered.sort((a, b) => {
      const dateA = parseISO(a.scheduled_date!);
      const dateB = parseISO(b.scheduled_date!);
      return dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [orders]);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-7 w-7" />
          Agendamentos
        </h2>

        <div className="space-y-4"> {/* Substituindo Card por div e ajustando espaçamento */}
          <h3 className="text-lg font-semibold">Ordens de Serviço Agendadas ({scheduledOrders.length})</h3>
          <div className="space-y-2">
            {scheduledOrders.length > 0 ? (
              scheduledOrders.map(order => (
                <OrderListItem key={order.id} order={order} />
              ))
            ) : (
              <p className="text-center text-muted-foreground text-sm py-8">
                Nenhuma Ordem de Serviço agendada encontrada.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarView;