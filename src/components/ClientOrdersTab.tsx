import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock } from "lucide-react";
import { useServiceOrders, ServiceOrder } from "@/hooks/useServiceOrders"; // Use refactored hook
import { Skeleton } from "@/components/ui/skeleton";
import { isActiveStatus } from "@/lib/serviceOrderStatus";
import OrderListItem from "./OrderListItem"; // Importando o componente reutilizável

interface ClientOrdersTabProps {
  clientId: string;
}

const ClientOrdersTab: React.FC<ClientOrdersTabProps> = ({ clientId }) => {
  const { orders: allOrders, isLoading } = useServiceOrders(); // Use 'orders' and 'isLoading' from refactored hook
  
  // Filtra as ordens pelo ID do cliente
  const clientOrders = allOrders.filter(order => order.client_id === clientId);

  const activeOrders = clientOrders.filter(o => isActiveStatus(o.status));
  const completedOrders = clientOrders.filter(o => !isActiveStatus(o.status));

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