import React from "react";
import Layout from "@/components/Layout";
import MetricCard from "@/components/MetricCard";
import StatusChart from "@/components/StatusChart";
import { Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard: React.FC = () => {
  const { totalOrders, pendingOrders, completedOrders, statusChartData, isLoading } = useDashboardMetrics();

  // Placeholder para Tempo Total Registrado, pois não temos a tabela de tempo ainda.
  const totalTimeRegistered = "0H"; 

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-1/3" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"> {/* Ajustado para grid-cols-1 em telas muito pequenas */}
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
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">DASHBOARD DE GESTÃO</h2>

        {/* Seção de Métricas */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"> {/* Ajustado para grid-cols-1 em telas muito pequenas */}
          <MetricCard
            title="TOTAL DE OS"
            value={totalOrders}
            description="TOTAL DE ORDENS DE SERVIÇO REGISTRADAS."
            icon={Users}
            iconColorClass="text-blue-500"
          />
          <MetricCard
            title="OS PENDENTES"
            value={pendingOrders}
            description="ORDENS AGUARDANDO INÍCIO."
            icon={AlertTriangle}
            iconColorClass="text-destructive"
          />
          <MetricCard
            title="OS CONCLUÍDAS (TOTAL)"
            value={completedOrders}
            description="ORDENS CONCLUÍDAS NO SISTEMA."
            icon={CheckCircle}
            iconColorClass="text-green-500"
          />
          <MetricCard
            title="TEMPO TOTAL REGISTRADO"
            value={totalTimeRegistered}
            description="TEMPO TOTAL DE TRABALHO REGISTRADO (MOCK)."
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
                title="PRÓXIMOS PASSOS"
                value="INTEGRAÇÃO DE TEMPO E ANEXOS"
                description="IMPLEMENTAR PERSISTÊNCIA DE DADOS PARA TEMPO E ANEXOS."
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