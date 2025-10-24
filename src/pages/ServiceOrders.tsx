import React from "react";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Definição de tipo para Ordem de Serviço
interface ServiceOrder {
  id: string;
  title: string;
  client: string;
  status: "Pendente" | "Em Progresso" | "Concluída" | "Cancelada";
  priority: "Alta" | "Média" | "Baixa";
  date: string;
}

// Dados mock
const mockOrders: ServiceOrder[] = [
  { id: "OS-001", title: "Reparo de Ar Condicionado", client: "Empresa A", status: "Em Progresso", priority: "Alta", date: "2024-10-27" },
  { id: "OS-002", title: "Instalação de Rede", client: "Cliente B", status: "Pendente", priority: "Média", date: "2024-10-28" },
  { id: "OS-003", title: "Manutenção Preventiva", client: "Indústria C", status: "Concluída", priority: "Baixa", date: "2024-10-26" },
  { id: "OS-004", title: "Substituição de Peça", client: "Loja D", status: "Pendente", priority: "Alta", date: "2024-10-29" },
];

const getStatusVariant = (status: ServiceOrder['status']) => {
  switch (status) {
    case "Concluída":
      return "default";
    case "Em Progresso":
      return "secondary";
    case "Pendente":
      return "destructive";
    case "Cancelada":
      return "outline";
    default:
      return "outline";
  }
};

const getPriorityColor = (priority: ServiceOrder['priority']) => {
  switch (priority) {
    case "Alta":
      return "text-red-600";
    case "Média":
      return "text-yellow-600";
    case "Baixa":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

const ServiceOrderCard: React.FC<{ order: ServiceOrder }> = ({ order }) => (
  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium truncate">{order.title}</CardTitle>
      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold mb-2">{order.id}</div>
      <p className="text-xs text-muted-foreground mb-1">Cliente: {order.client}</p>
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Data: {order.date}</span>
        <span className={`font-semibold ${getPriorityColor(order.priority)}`}>
          Prioridade: {order.priority}
        </span>
      </div>
    </CardContent>
  </Card>
);


const ServiceOrders: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
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
  );
};

export default ServiceOrders;