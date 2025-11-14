import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServiceOrders, ServiceOrder } from "@/hooks/useServiceOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { isActiveStatus } from "@/lib/serviceOrderStatus";
import OrderListItem from "./OrderListItem"; // Importando o componente reutilizável

interface ClientOrdersTabProps {
  clientId: string;
}

const ClientOrdersTab: React.FC<ClientOrdersTabProps> = ({ clientId }) => {
  const { orders: allOrders, isLoading } = useServiceOrders();
  
  // Filtra as ordens pelo ID do cliente
  const clientOrders = allOrders.filter(order => order.client_id === clientId);

  const activeOrders = clientOrders.filter(o => isActiveStatus(o.status));
  const completedOrders = clientOrders.filter(o => !isActiveStatus(o.status));

  // Combina as ordens, colocando as ativas primeiro
  const combinedOrders = [...activeOrders, ...completedOrders];

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
        <CardTitle className="text-lg">Ordens de Serviço do Cliente ({combinedOrders.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {renderOrderList(combinedOrders, "Nenhuma Ordem de Serviço encontrada para este cliente.")}
      </CardContent>
    </Card>
  );
};

export default ClientOrdersTab;