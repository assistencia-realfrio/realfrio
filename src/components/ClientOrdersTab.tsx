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
  client: string; // Adicionando cliente para filtragem
}

interface ClientOrdersTabProps {
  clientId: string;
}

// Mapeamento de IDs de Cliente para Nomes (de ClientTable.tsx)
const clientMap: { [key: string]: string } = {
    "C-001": "Empresa Alpha Soluções",
    "C-002": "Cliente Beta Individual",
    "C-003": "Indústria Gama Pesada",
    "C-004": "Loja Delta Varejo",
};

// Dados mock de OS (sincronizados com ServiceOrders.tsx)
const allMockOrders: ServiceOrder[] = [
    { id: "OS-001", title: "Reparo de Ar Condicionado", client: "Empresa Alpha Soluções", status: "Em Progresso", priority: "Alta", date: "2024-10-27" },
    { id: "OS-002", title: "Instalação de Rede", client: "Cliente Beta Individual", status: "Pendente", priority: "Média", date: "2024-10-28" },
    { id: "OS-003", title: "Manutenção Preventiva", client: "Empresa Alpha Soluções", status: "Concluída", priority: "Baixa", date: "2024-10-26" },
    { id: "OS-004", title: "Substituição de Peça", client: "Loja Delta Varejo", status: "Pendente", priority: "Alta", date: "2024-10-29" },
    { id: "OS-005", title: "Configuração de Servidor", client: "Empresa Alpha Soluções", status: "Em Progresso", priority: "Média", date: "2024-10-30" },
    { id: "OS-006", title: "Revisão Geral", client: "Cliente Beta Individual", status: "Pendente", priority: "Baixa", date: "2024-11-01" },
    { id: "OS-007", title: "OS Cancelada", client: "Indústria Gama Pesada", status: "Cancelada", priority: "Baixa", date: "2024-11-02" },
    { id: "OS-008", title: "Reparo Urgente de Eletricidade", client: "Empresa Alpha Soluções", status: "Pendente", priority: "Alta", date: "2024-11-03" },
    { id: "OS-009", title: "Instalação de Software", client: "Cliente Beta Individual", status: "Concluída", priority: "Média", date: "2024-11-04" },
    { id: "OS-010", title: "Limpeza de Equipamento", client: "Loja Delta Varejo", status: "Concluída", priority: "Baixa", date: "2024-11-05" },
];


const mockFetchOrders = (clientId: string): ServiceOrder[] => {
  const clientName = clientMap[clientId];
  if (!clientName) return [];
  
  // Filtra as ordens pelo nome do cliente
  return allMockOrders
    .filter(order => order.client === clientName)
    .sort((a, b) => {
        // Ordena por data (mais recente primeiro)
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
    });
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