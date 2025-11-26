import React, { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { useServiceOrders, ServiceOrder } from "@/hooks/useServiceOrders";
import { parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ServiceOrderCard from "@/components/ServiceOrderCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/useProfile"; // Importar useProfile para desabilitar durante o carregamento

type StoreFilter = ServiceOrder['store'] | 'ALL';

const CalendarView: React.FC = () => {
  const { isLoading: isLoadingProfile } = useProfile();
  const [selectedStore, setSelectedStore] = useState<StoreFilter>('ALL');
  
  // Passar o filtro de loja para useServiceOrders
  const { orders, isLoading } = useServiceOrders(undefined, selectedStore);

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

  if (isLoading || isLoadingProfile) {
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-7 w-7" />
            Agendamentos
          </h2>
          <div className="w-full sm:w-48">
            <Select 
              onValueChange={(value: StoreFilter) => setSelectedStore(value)} 
              value={selectedStore}
              disabled={isLoadingProfile}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filtrar por Loja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as Lojas</SelectItem>
                <SelectItem value="CALDAS DA RAINHA">Caldas da Rainha</SelectItem>
                <SelectItem value="PORTO DE MÓS">Porto de Mós</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ordens de Serviço Agendadas ({scheduledOrders.length})</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {scheduledOrders.length > 0 ? (
              scheduledOrders.map(order => (
                <ServiceOrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Nenhuma Ordem de Serviço agendada encontrada.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarView;