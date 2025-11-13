import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";
import { Equipment } from "@/hooks/useEquipments";

interface EquipmentDetailsViewProps {
  equipment: Equipment;
}

const EquipmentDetailsView: React.FC<EquipmentDetailsViewProps> = ({ equipment }) => {
  const hasGoogleDriveLink = equipment.google_drive_link && equipment.google_drive_link.trim() !== '';

  return (
    <Card>
      <CardContent className="space-y-4 text-sm pt-6">
        <div>
          <p className="text-muted-foreground">Nome</p>
          <p className="font-medium">{equipment.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Marca</p>
          <p className="font-medium">{equipment.brand || 'N/A'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Modelo</p>
          <p className="font-medium">{equipment.model || 'N/A'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Número de Série</p>
          <p className="font-medium">{equipment.serial_number || 'N/A'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Google Drive</p>
          {hasGoogleDriveLink ? (
            <a 
              href={equipment.google_drive_link!} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <FolderOpen className="h-4 w-4" />
              Abrir Pasta
            </a>
          ) : (
            <p className="text-muted-foreground">N/A</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentDetailsView;