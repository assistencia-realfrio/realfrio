import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEquipments } from "@/hooks/useEquipments";
import EquipmentOrdersTab from "@/components/EquipmentOrdersTab";
import ActivityLog from "@/components/ActivityLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Wrench, History } from "lucide-react";

interface ServiceOrderEquipmentDetailsProps {
  equipmentId: string;
}

const ServiceOrderEquipmentDetails: React.FC<ServiceOrderEquipmentDetailsProps> = ({ equipmentId }) => {
  const { singleEquipment: equipment, isLoading } = useEquipments(undefined, equipmentId);
  const [selectedTab, setSelectedTab] = React.useState<"details" | "orders" | "history">("details");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold">EQUIPAMENTO NÃO ENCONTRADO</h3>
        <p className="text-muted-foreground">NÃO FOI POSSÍVEL CARREGAR OS DETALHES DO EQUIPAMENTO.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-none border-none">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg">DETALHES DO EQUIPAMENTO</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="details" onValueChange={(value: "details" | "orders" | "history") => setSelectedTab(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">
              <FileText className="h-4 w-4 mr-2" />
              DETALHES
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Wrench className="h-4 w-4 mr-2" />
              ORDENS
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              HISTÓRICO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">NOME</p>
                <p className="font-medium">{equipment.name.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">MARCA</p>
                <p className="font-medium">{(equipment.brand || 'N/A').toUpperCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">MODELO</p>
                <p className="font-medium">{(equipment.model || 'N/A').toUpperCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">NÚMERO DE SÉRIE</p>
                <p className="font-medium">{(equipment.serial_number || 'N/A').toUpperCase()}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <EquipmentOrdersTab equipmentId={equipment.id} />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ActivityLog entityType="equipment" entityId={equipment.id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ServiceOrderEquipmentDetails;