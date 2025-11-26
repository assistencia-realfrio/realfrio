import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";
import { Equipment } from "@/hooks/useEquipments";

interface EquipmentDetailsViewProps {
  equipment: Equipment;
}

const EquipmentDetailsView: React.FC<EquipmentDetailsViewProps> = ({ equipment }) => {
  return (
    <Card>
      <CardContent className="space-y-4 text-sm pt-6">
        <div>
          <p className="text-muted-foreground uppercase">Nome</p>
          <p className="font-medium uppercase">{equipment.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground uppercase">Marca</p>
          <p className="font-medium uppercase">{equipment.brand || 'N/A'}</p>
        </div>
        <div>
          <p className="text-muted-foreground uppercase">Modelo</p>
          <p className="font-medium uppercase">{equipment.model || 'N/A'}</p>
        </div>
        <div>
          <p className="text-muted-foreground uppercase">Número de Série</p>
          <p className="font-medium uppercase">{equipment.serial_number || 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentDetailsView;