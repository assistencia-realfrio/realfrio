import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEquipments } from "@/hooks/useEquipments";
import EquipmentOrdersTab from "@/components/EquipmentOrdersTab";
import ActivityLog from "@/components/ActivityLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Wrench, History, Camera } from "lucide-react";
import EquipmentDetailsView from "./EquipmentDetailsView";
import EquipmentPlatePhoto from "./EquipmentPlatePhoto";

interface ServiceOrderEquipmentDetailsProps {
  equipmentId: string;
}

const ServiceOrderEquipmentDetails: React.FC<ServiceOrderEquipmentDetailsProps> = ({ equipmentId }) => {
  const { singleEquipment: equipment, isLoading } = useEquipments(undefined, equipmentId);
  
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
      <Tabs defaultValue="details"> {/* Alterado o defaultValue para 'details' */}
        <TabsList className="grid w-full grid-cols-2 px-4"> {/* Ajustado para 2 colunas */}
          <TabsTrigger value="details">
            <FileText className="h-4 w-4 mr-2" />
            Detalhes
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Wrench className="h-4 w-4 mr-2" />
            Ordens
          </TabsTrigger>
          {/* Removido TabsTrigger para 'Histórico' */}
        </TabsList>
        
        <TabsContent value="details" className="mt-4 space-y-6"> {/* Adicionado space-y-6 para espaçamento */}
          {/* Usando o componente EquipmentDetailsView para exibir os detalhes */}
          <EquipmentDetailsView equipment={equipment} />
          {/* Novo componente para a foto da chapa, agora dentro da aba de detalhes */}
          <EquipmentPlatePhoto equipmentId={equipment.id} />
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <EquipmentOrdersTab equipmentId={equipment.id} />
        </TabsContent>

        {/* Removido TabsContent para 'Histórico' */}
      </Tabs>
    </Card>
  );
};

export default ServiceOrderEquipmentDetails;