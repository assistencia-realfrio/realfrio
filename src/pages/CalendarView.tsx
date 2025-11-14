import React, { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServiceOrders } from "@/hooks/useServiceOrders";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import OrderListItem from "@/components/OrderListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  // Modifiers (para marcar datas com OS) são mantidos, mas não serão usados no calendário compacto.
  // Removendo o cálculo de modifiers, pois não são mais necessários para o calendário mensal.
  /*
  const modifiers = useMemo(() => {
    const datesWithOrders = scheduledOrders.map(order => parseISO(order.scheduled_date!));
    return {
      scheduled: datesWithOrders,
    };
  }, [scheduledOrders]);

  const modifiersClassNames = {
    scheduled: "bg-primary text-primary-foreground rounded-full",
  };
  */

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-7 w-7" />
          Calendário de Agendamentos
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card de Seleção de Data Compacto */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Selecione uma Data</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                                format(selectedDate, "PPP", { locale: ptBR })
                            ) : (
                                <span>Selecione uma data</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={ptBR}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </CardContent>
          </Card>
          {/* Fim do Card de Seleção de Data Compacto */}

          <Card className="lg:col-span-1">
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