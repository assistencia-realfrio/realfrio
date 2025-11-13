import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEquipments } from "@/hooks/useEquipments";
import EquipmentOrdersTab from "@/components/EquipmentOrdersTab";
import ActivityLog from "@/components/ActivityLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Wrench, History, Camera } from "lucide-react"; // Adicionado Camera
import EquipmentDetailsView from "./EquipmentDetailsView"; // Importar o componente de visualização
import EquipmentPlatePhoto from "./EquipmentPlatePhoto"; // Importar o componente de foto da chapa

interface ServiceOrderEquipmentDetailsProps {
  equipmentId: string;
}

const ServiceOrderEquipmentDetails: React.FC<ServiceOrderEquipmentDetailsProps> = ({ equipmentId }) => {
  const { singleEquipment: equipment, isLoading } = useEquipments(undefined, equipmentId);
  
  // O estado local de selectedTab não é mais necessário, pois usamos Tabs do shadcn/ui

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
        <h3 className="text-xl font-bold">Equipamento não encontrado</h3>
        <p className="text-muted-foreground">Não foi possível carregar os detalhes do equipamento.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-none border-none">
      <Tabs defaultValue="plate_photo"> {/* Alterado o defaultValue para 'plate_photo' */}
        <TabsList className="grid w-full grid-cols-4 px-4"> {/* Aumentado para 4 colunas */}
          <TabsTrigger value="plate_photo"> {/* Nova aba para Foto da Chapa */}
            <Camera className="h-4 w-4 mr-2" />
            Chapa
          </TabsTrigger>
          <TabsTrigger value="details">
            <FileText className="h-4 w-4 mr-2" />
            Detalhes
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Wrench className="h-4 w-4 mr-2" />
            Ordens
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plate_photo" className="mt-4"> {/* Conteúdo da Foto da Chapa */}
          <EquipmentPlatePhoto equipmentId={equipment.id} />
        </TabsContent>
        
        <TabsContent value="details" className="mt-4">
          {/* Usando o componente EquipmentDetailsView para exibir os detalhes */}
          <EquipmentDetailsView equipment={equipment} />
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <EquipmentOrdersTab equipmentId={equipment.id} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <ActivityLog entityType="equipment" entityId={equipment.id} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ServiceOrderEquipmentDetails;