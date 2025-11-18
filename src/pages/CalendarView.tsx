import React, { useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServiceOrders } from "@/hooks/useServiceOrders";
import { format, parseISO, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import OrderListItem from "@/components/OrderListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

    // 3. Agrupar por data
    const grouped = filtered.reduce((acc, order) => {
      const dateKey = format(parseISO(order.scheduled_date!), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(order);
      return acc;
    }, {} as Record<string, typeof orders>);

    return grouped;
  }, [orders]);

  const sortedDates = useMemo(() => {
    return Object.keys(scheduledOrders).sort((a, b) => {
      return parseISO(a).getTime() - parseISO(b).getTime();
    });
  }, [scheduledOrders]);

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
          Próximos Agendamentos
        </h2>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ordens de Serviço Agendadas ({orders.filter(o => o.scheduled_date).length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sortedDates.length > 0 ? (
              <div className="space-y-6">
                {sortedDates.map((dateKey) => {
                  const date = parseISO(dateKey);
                  const isOverdue = isPast(date) && !orders.some(o => o.scheduled_date === dateKey && (o.status === 'CONCLUIDA' || o.status === 'CANCELADA'));
                  
                  return (
                    <div key={dateKey}>
                      <div className={cn(
                        "flex items-center gap-3 py-2 px-3 rounded-md",
                        isOverdue ? "bg-destructive/10 border-l-4 border-destructive" : "bg-muted/50 border-l-4 border-primary"
                      )}>
                        <CalendarIcon className={cn("h-5 w-5", isOverdue ? "text-destructive" : "text-primary")} />
                        <h3 className={cn("font-semibold text-base", isOverdue ? "text-destructive" : "text-foreground")}>
                          {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                          {isOverdue && <span className="ml-2 text-sm font-normal text-destructive">(Vencido)</span>}
                        </h3>
                      </div>
                      <div className="mt-4 space-y-2">
                        {scheduledOrders[dateKey].map(order => (
                          <OrderListItem key={order.id} order={order} />
                        ))}
                      </div>
                      <Separator className="mt-6" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-8">
                Nenhuma Ordem de Serviço agendada encontrada.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CalendarView;