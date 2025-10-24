import React from "react";
import Layout from "@/components/Layout";
import MetricCard from "@/components/MetricCard";
import StatusChart from "@/components/StatusChart";
import { Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de Gestão</h2>

        {/* Seção de Métricas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de OS"
            value={100}
            description="Total de Ordens de Serviço registradas."
            icon={Users}
            iconColorClass="text-blue-500"
          />
          <MetricCard
            title="OS Pendentes"
            value={15}
            description="Ordens aguardando início."
            icon={AlertTriangle}
            iconColorClass="text-destructive"
          />
          <MetricCard
            title="OS Concluídas (Mês)"
            value={55}
            description="Concluídas no último mês."
            icon={CheckCircle}
            iconColorClass="text-green-500"
          />
          <MetricCard
            title="Tempo Total Registrado"
            value="850h"
            description="Tempo total de trabalho registrado."
            icon={Clock}
            iconColorClass="text-yellow-500"
          />
        </div>

        {/* Seção de Gráficos */}
        <div className="grid gap-4 lg:grid-cols-3">
          <StatusChart />
          {/* Outros gráficos ou listas podem ser adicionados aqui */}
          <div className="lg:col-span-2">
            <MetricCard
                title="Próximos Passos"
                value="Integração com API"
                description="Adicionar autenticação e persistência de dados."
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