import React, { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Calendar as CalendarIcon, User, Clock } from "lucide-react";
import { useServiceOrders, ServiceOrder } from "@/hooks/useServiceOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday, isTomorrow, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import OrderListItem from "@/components/OrderListItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTechnicians } from "@/hooks/useTechnicians";
import { Calendar } from "@/components/ui/calendar"; // Importar o componente Calendar

const CalendarPage: React.FC = () => {
  const { orders, isLoading: isLoadingOrders } = useServiceOrders();
  const { data: technicians, isLoading: isLoadingTechnicians } = useTechnicians();

  const isLoading = isLoadingOrders || isLoadingTechnicians;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Estado para a data selecionada no calendário

  const technicianMap = useMemo(() => {
    return technicians?.reduce((map, tech) => {
        map.set(tech.id, tech.full_name);
        return map;
    }, new Map<string, string>()) || new Map<string, string>();
  }, [technicians]);

  const scheduledOrders = useMemo(() => {
    return orders
      .filter(order => order.scheduled_date)
      .map(order => ({
        ...order,
        scheduledDateObj: parseISO(order.scheduled_date!),
        technicianName: order.technician_id ? technicianMap.get(order.technician_id) : null,
      }))
      .sort((a, b) => a.scheduledDateObj.getTime() - b.scheduledDateObj.getTime());
  }, [orders, technicianMap]);

  const groupedOrders = useMemo(() => {
    return scheduledOrders.reduce((acc, order) => {
      const dateKey = format(order.scheduledDateObj, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(order);
      return acc;
    }, {} as Record<string, (ServiceOrder & { scheduledDateObj: Date, technicianName: string | null })[]>);
  }, [scheduledOrders]);

  // Filtra as ordens para exibir apenas as da data selecionada
  const ordersForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return groupedOrders[dateKey] || [];
  }, [selectedDate, groupedOrders]);

  const formatDateHeader = (date: Date): string => {
    if (isToday(date)) return `Hoje, ${format(date, 'dd/MM', { locale: ptBR })}`;
    if (isTomorrow(date)) return `Amanhã, ${format(date, 'dd/MM', { locale: ptBR })}`;
    return format(date, 'EEEE, dd \'de\' MMMM', { locale: ptBR });
  };

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
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-7 w-7 text-primary" />
            Calendário de Agendamentos
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendário Mensal */}
          <Card className="lg:col-span-1">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold">Navegar por Mês</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                locale={ptBR}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Ordens para a Data Selecionada */}
          <Card className="lg:col-span-1">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold">
                Ordens para {selectedDate ? formatDateHeader(selectedDate) : 'Nenhuma Data Selecionada'} ({ordersForSelectedDate.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {ordersForSelectedDate.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Nenhuma Ordem de Serviço agendada para esta data.
                </p>
              ) : (
                ordersForSelectedDate.map(order => (
                  <div key={order.id} className="border p-3 rounded-md hover:bg-background transition-colors">
                      <OrderListItem order={order} />
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
                          <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Agendado: {format(order.scheduledDateObj, 'HH:mm', { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>Técnico: {order.technicianName || 'Não Atribuído'}</span>
                          </div>
                      </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;