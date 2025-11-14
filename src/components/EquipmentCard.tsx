import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { HardDrive, Tag, Box, Hash } from "lucide-react";
import { Equipment } from "@/hooks/useEquipments";
import { cn } from "@/lib/utils";

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/equipments/${equipment.id}`);
  };

  return (
    <Card 
      onClick={handleNavigate}
      className={cn(
        "hover:shadow-md transition-shadow flex relative rounded-lg border bg-card cursor-pointer overflow-hidden"
      )}
    >
      <div className="flex flex-col flex-grow p-4">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-semibold text-lg truncate">{equipment.name}</h3>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          {equipment.brand && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 flex-shrink-0" />
              <p className="truncate">Marca: {equipment.brand}</p>
            </div>
          )}
          {equipment.model && (
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 flex-shrink-0" />
              <p className="truncate">Modelo: {equipment.model}</p>
            </div>
          )}
          {equipment.serial_number && (
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 flex-shrink-0" />
              <p className="truncate">Nº Série: {equipment.serial_number}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EquipmentCard;