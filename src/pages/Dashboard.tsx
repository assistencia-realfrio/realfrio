import React, { useState } from "react";
import Layout from "@/components/Layout";
import MetricCard from "@/components/MetricCard";
import StatusChart from "@/components/StatusChart";
import { Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { useProfile } from "@/hooks/useProfile";

type StoreFilter = ServiceOrder['store'] | 'ALL';

const Dashboard: React.FC = () => {
  const { isLoading: isLoadingProfile } = useProfile();
  const [selectedStore, setSelectedStore] = useState<StoreFilter>('ALL');
  
  const { totalOrders, pendingOrders, completedOrders, statusChartData, isLoading } = useDashboardMetrics(selectedStore);

  // Placeholder para Tempo Total Registrado, pois não temos a tabela de tempo ainda.
  const totalTimeRegistered = "0h"; 

  if (isLoading || isLoadingProfile) {
    return (
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-1/3" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
          <Skeleton className="h-[350px] w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard de Gestão</h2>
          <div className="w-full sm:w-48">
            <Select 
              onValueChange={(value: StoreFilter) => setSelectedStore(value)} 
              value={selectedStore}
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

        {/* Seção de Métricas */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de OS"
            value={totalOrders}
            description="Total de Ordens de Serviço registradas."
            icon={Users}
            iconColorClass="text-blue-500"
          />
          <MetricCard
            title="OS Pendentes"
            value={pendingOrders}
            description="Ordens aguardando início."
            icon={AlertTriangle}
            iconColorClass="text-destructive"
          />
          <MetricCard
            title="OS Concluídas (Total)"
            value={completedOrders}
            description="Ordens concluídas no sistema."
            icon={CheckCircle}
            iconColorClass="text-green-500"
          />
          <MetricCard
            title="Tempo Total Registrado"
            value={totalTimeRegistered}
            description="Tempo total de trabalho registrado (Mock)."
            icon={Clock}
            iconColorClass="text-yellow-500"
          />
        </div>

        {/* Seção de Gráficos */}
        <div className="grid gap-4 lg:grid-cols-3">
          <StatusChart data={statusChartData} isLoading={isLoading} />
          {/* Outros gráficos ou listas podem ser adicionados aqui */}
          <div className="lg:col-span-2">
            <MetricCard
                title="Próximos Passos"
                value="Integração de Tempo e Anexos"
                description="Implementar persistência de dados para Tempo e Anexos."
                icon={Users}
                iconColorClass="text-gray-500"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;