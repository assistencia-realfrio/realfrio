import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Reutilizando a estrutura de ServiceOrder
interface ServiceOrder {
  id: string;
  title: string;
  status: "Pendente" | "Em Progresso" | "Concluída" | "Cancelada";
  priority: "Alta" | "Média" | "Baixa";
  date: string;
}

interface ClientOrdersTabProps {
  clientId: string;
}

// Mock Data para simular as OS de um cliente
const mockFetchOrders = (clientId: string): ServiceOrder[] => {
  // Simulação de dados baseados no ID do cliente
  if (clientId === "C-001") {
    return [
      { id: "OS-001", title: "Reparo de Ar Condicionado", status: "Em Progresso", priority: "Alta", date: "2024-10-27" },
      { id: "OS-005", title: "Manutenção de Servidor", status: "Pendente", priority: "Média", date: "2024-11-01" },
      { id: "OS-003", title: "Manutenção Preventiva", status: "Concluída", priority: "Baixa", date: "2024-10-26" },
      { id: "OS-006", title: "Instalação de Câmeras", status: "Concluída", priority: "Alta", date: "2024-09-15" },
    ];
  }
  if (clientId === "C-002") {
    return [
      { id: "OS-002", title: "Instalação de Rede", status: "Pendente", priority: "Média", date: "2024-10-28" },
    ];
  }
  return [];
};

const getStatusVariant = (status: ServiceOrder['status']): "default" | "secondary" | "destructive" | "outline" => {
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

const OrderListItem: React.FC<{ order: ServiceOrder }> = ({ order }) => {
    const navigate = useNavigate();
    
    const handleViewDetails = () => {
        navigate(`/orders/${order.id}`);
    };

    return (
        <div className="flex justify-between items-center py-2 hover:bg-muted/50 px-2 rounded-md transition-colors">
            <div className="flex flex-col">
                <span className="font-medium text-sm">{order.title}</span>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{order.id}</span>
                    <span>|</span>
                    <span>{order.date}</span>
                    <span>|</span>
                    <Badge variant="outline" className="h-4 px-1.5">{order.priority}</Badge>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                <Button variant="ghost" size="icon" onClick={handleViewDetails} aria-label={`Ver detalhes da OS ${order.id}`}>
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};


const ClientOrdersTab: React.FC<ClientOrdersTabProps> = ({ clientId }) => {
  const allOrders = mockFetchOrders(clientId);
  
  const activeOrders = allOrders.filter(o => o.status === "Pendente" || o.status === "Em Progresso");
  const completedOrders = allOrders.filter(o => o.status === "Concluída" || o.status === "Cancelada");

  const renderOrderList = (orders: ServiceOrder[], emptyMessage: string) => (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {orders.length > 0 ? (
        orders.map(order => <OrderListItem key={order.id} order={order} />)
      ) : (
        <p className="text-center text-muted-foreground py-8 text-sm">{emptyMessage}</p>
      )}
    </div>
  );

  return (
    <Card className="shadow-none border-none">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg">Ordens de Serviço do Cliente</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
                <Clock className="h-4 w-4 mr-2" />
                Ativas ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
                <CheckCircle className="h-4 w-4 mr-2" />
                Concluídas ({completedOrders.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4">
            {renderOrderList(activeOrders, "Nenhuma OS ativa para este cliente.")}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            {renderOrderList(completedOrders, "Nenhuma OS concluída para este cliente.")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ClientOrdersTab;