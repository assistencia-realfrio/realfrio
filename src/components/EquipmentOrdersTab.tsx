import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock } from "lucide-react";
import { useServiceOrders, ServiceOrder } from "@/hooks/useServiceOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { isActiveStatus } from "@/lib/serviceOrderStatus";
import OrderListItem from "./OrderListItem";

interface EquipmentOrdersTabProps {
  equipmentId: string;
}

const EquipmentOrdersTab: React.FC<EquipmentOrdersTabProps> = ({ equipmentId }) => {
  const { orders: allOrders, isLoading } = useServiceOrders();
  
  const equipmentOrders = allOrders.filter(order => order.equipment_id === equipmentId);

  const activeOrders = equipmentOrders.filter(o => isActiveStatus(o.status));
  const completedOrders = equipmentOrders.filter(o => !isActiveStatus(o.status));

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
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg uppercase">Ordens de Serviço do Equipamento ({combinedOrders.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {renderOrderList(combinedOrders, "Nenhuma Ordem de Serviço encontrada para este equipamento.")}
      </CardContent>
    </div>
  );
};

export default EquipmentOrdersTab;