import React, { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServiceOrders, ServiceOrder } from "@/hooks/useServiceOrders";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import OrderListItem from "@/components/OrderListItem";
import { Skeleton } from "@/components/ui/skeleton";

const CalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { orders, isLoading } = useServiceOrders();

  const scheduledOrders = useMemo(() => {
    return orders.filter(order => order.scheduled_date);
  }, [orders]);

  const ordersForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return scheduledOrders.filter(order => 
      order.scheduled_date && isSameDay(parseISO(order.scheduled_date), selectedDate)
    );
  }, [selectedDate, scheduledOrders]);

  const modifiers = useMemo(() => {
    const datesWithOrders = scheduledOrders.map(order => parseISO(order.scheduled_date!));
    return {
      scheduled: datesWithOrders,
    };
  }, [scheduledOrders]);

  const modifiersClassNames = {
    scheduled: "bg-primary text-primary-foreground rounded-full",
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-7 w-7" />
          Calendário de Agendamentos
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Selecione uma Data</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                className="rounded-md border shadow"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                OS Agendadas para {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Nenhuma Data Selecionada"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : ordersForSelectedDate.length > 0 ? (
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  {ordersForSelectedDate.map(order => (
                    <OrderListItem key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                  Nenhuma Ordem de Serviço agendada para esta data.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarView;