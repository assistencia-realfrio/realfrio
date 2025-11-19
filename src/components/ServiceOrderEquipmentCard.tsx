import React from "react";
import { useFormContext } from "react-hook-form";
import { HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import EquipmentSelector from "./EquipmentSelector";
import { useNavigate } from "react-router-dom";
import { ServiceOrderFormValues } from "./ServiceOrderForm"; // Importar o tipo do formulário

interface ServiceOrderEquipmentCardProps {
  isEditing: boolean;
  onEquipmentChange: (equipmentId: string, details: { name: string, brand: string | null, model: string | null, serial_number: string | null }) => void;
  clientId: string;
}

const ServiceOrderEquipmentCard: React.FC<ServiceOrderEquipmentCardProps> = ({
  isEditing,
  onEquipmentChange,
  clientId,
}) => {
  const form = useFormContext<ServiceOrderFormValues>();
  const navigate = useNavigate();

  const equipmentId = form.watch("equipment_id");

  const handleViewEquipmentDetails = () => equipmentId && navigate(`/equipments/${equipmentId}`);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Equipamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="equipment_id"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <div className="flex-grow">
                  <EquipmentSelector
                    clientId={clientId}
                    value={field.value}
                    onChange={onEquipmentChange}
                    disabled={isEditing}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleViewEquipmentDetails}
                  disabled={!equipmentId}
                  aria-label="Ver Detalhes do Equipamento"
                >
                  <HardDrive className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default ServiceOrderEquipmentCard;