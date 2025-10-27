import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useServiceOrders, ServiceOrder } from "@/hooks/useServiceOrders";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientOrdersTabProps {
  clientId: string;
}

const getStatusVariant = (status: ServiceOrder['status']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Concluída":
      return "default";
    case "Em Progresso":
      return "secondary";
    case "Pendente":
      return "destructive";
    case "Cancelada":
    default:
      return "outline";
  }
};

const OrderListItem: React.FC<{ order: ServiceOrder }> = ({ order }) => {
    const navigate = useNavigate();
    
    const handleViewDetails = () => {
        navigate(`/orders/${order.id}`);
    };
    
    const date = new Date(order.created_at).toLocaleDateString('pt-BR');

    return (
        <div className="flex justify-between items-center py-2 hover:bg-muted/50 px-2 rounded-md transition-colors">
            <div className="flex flex-col">
                <span className="font-medium text-sm">{order.equipment} - {order.model}</span>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{order.id.substring(0, 8)}...</span>
                    <span>|</span>
                    <span>{date}</span>
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
  const { orders: allOrders, isLoading } = useServiceOrders();
  
  // Filtra as ordens pelo ID do cliente
  const clientOrders = allOrders.filter(order => order.client_id === clientId);

  const activeOrders = clientOrders.filter(o => o.status === "Pendente" || o.status === "Em Progresso");
  const completedOrders = clientOrders.filter(o => o.status === "Concluída" || o.status === "Cancelada");

  const renderOrderList = (orders: ServiceOrder[], emptyMessage: string) => (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {isLoading ? (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      ) : orders.length > 0 ? (
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