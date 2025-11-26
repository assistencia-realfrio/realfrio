import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServiceOrders, ServiceOrder } from "@/hooks/useServiceOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { isActiveStatus } from "@/lib/serviceOrderStatus";
import OrderListItem from "./OrderListItem";

interface ClientOrdersTabProps {
  clientId: string;
}

const ClientOrdersTab: React.FC<ClientOrdersTabProps> = ({ clientId }) => {
  const { orders: allOrders, isLoading } = useServiceOrders();
  
  const clientOrders = allOrders.filter(order => order.client_id === clientId);

  const activeOrders = clientOrders.filter(o => isActiveStatus(o.status));
  const completedOrders = clientOrders.filter(o => !isActiveStatus(o.status));

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
        <p className="text-center text-muted-foreground py-8 text-sm uppercase">{emptyMessage}</p>
      )}
    </div>
  );

  return (
    <div className="shadow-none border-none">
      <div className="p-0 pb-4">
      </div>
      <div className="p-0">
        {renderOrderList(combinedOrders, "Nenhuma Ordem de Serviço encontrada para este cliente.")}
      </div>
    </div>
  );
};

export default ClientOrdersTab;