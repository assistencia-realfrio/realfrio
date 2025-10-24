import React from "react";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceOrderCard from "@/components/ServiceOrderCard";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";

// Definição de tipo para Ordem de Serviço (mantida aqui para mock data)
interface ServiceOrder {
  id: string;
  title: string;
  client: string;
  status: "Pendente" | "Em Progresso" | "Concluída" | "Cancelada";
  priority: "Alta" | "Média" | "Baixa";
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS"; // Novo campo
  date: string;
}

// Dados mock
const mockOrders: ServiceOrder[] = [
  { id: "OS-001", title: "Reparo de Ar Condicionado", client: "Empresa A", status: "Em Progresso", priority: "Alta", store: "CALDAS DA RAINHA", date: "2024-10-27" },
  { id: "OS-002", title: "Instalação de Rede", client: "Cliente B", status: "Pendente", priority: "Média", store: "PORTO DE MÓS", date: "2024-10-28" },
  { id: "OS-003", title: "Manutenção Preventiva", client: "Indústria C", status: "Concluída", priority: "Baixa", store: "CALDAS DA RAINHA", date: "2024-10-26" },
  { id: "OS-004", title: "Substituição de Peça", client: "Loja D", status: "Pendente", priority: "Alta", store: "PORTO DE MÓS", date: "2024-10-29" },
];


const ServiceOrders: React.FC = () => {
  const navigate = useNavigate();

  const handleNewOrder = () => {
    navigate("/orders/new");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button className="w-full sm:w-auto" onClick={handleNewOrder}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova OS
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por ID, cliente ou título..." className="pl-10" />
          </div>
          {/* Futuros filtros podem ir aqui */}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockOrders.map((order) => (
            <ServiceOrderCard key={order.id} order={order} />
          ))}
        </div>
        
        {mockOrders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma ordem de serviço encontrada.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ServiceOrders;