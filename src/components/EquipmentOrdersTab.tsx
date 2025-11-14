import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock } from "lucide-react";
import { useServiceOrders, ServiceOrder } from "@/hooks/useServiceOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { isActiveStatus } from "@/lib/serviceOrderStatus";
import OrderListItem from "./OrderListItem"; // Reutilizando o componente

interface EquipmentOrdersTabProps {
  equipmentId: string;
}

const EquipmentOrdersTab: React.FC<EquipmentOrdersTabProps> = ({ equipmentId }) => {
  const { orders: allOrders, isLoading } = useServiceOrders();
  
  // Filtra as ordens pelo ID do equipamento
  const equipmentOrders = allOrders.filter(order => order.equipment_id === equipmentId);

  const activeOrders = equipmentOrders.filter(o => isActiveStatus(o.status));
  const completedOrders = equipmentOrders.filter(o => !isActiveStatus(o.status));

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
    <div className="shadow-none border-none"> {/* Removido o Card externo */}
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg">Ordens de Serviço do Equipamento</CardTitle>
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
            {renderOrderList(activeOrders, "Nenhuma OS ativa para este equipamento.")}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            {renderOrderList(completedOrders, "Nenhuma OS concluída para este equipamento.")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
};

export default EquipmentOrdersTab;