import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { useEquipments, Equipment } from "@/hooks/useEquipments";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import EquipmentForm from "./EquipmentForm";

interface EquipmentSelectorProps {
  clientId: string;
  value: string;
  onChange: (equipmentId: string, equipmentDetails: { name: string, brand: string | null, model: string | null, serial_number: string | null }) => void;
  disabled?: boolean;
}

const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({ clientId, value, onChange, disabled = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { equipments, isLoading } = useEquipments(clientId);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "NEW_EQUIPMENT") {
      setIsModalOpen(true);
    } else {
      const selectedEquipment = equipments.find(e => e.id === selectedValue);
      if (selectedEquipment) {
        onChange(selectedEquipment.id, {
            name: selectedEquipment.name,
            brand: selectedEquipment.brand,
            model: selectedEquipment.model,
            serial_number: selectedEquipment.serial_number,
        });
        setIsPopoverOpen(false);
      }
    }
  };
  
  const handleNewEquipmentSubmit = (newEquipment: Equipment) => {
    onChange(newEquipment.id, {
        name: newEquipment.name,
        brand: newEquipment.brand,
        model: newEquipment.model,
        serial_number: newEquipment.serial_number,
    });
    setIsModalOpen(false);
  };

  if (!clientId) {
    return (
        <Button
            variant="outline"
            role="combobox"
            disabled
            className="w-full justify-between text-muted-foreground uppercase"
        >
            Equipamento
            <PlusCircle className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const selectedEquipment = equipments.find(e => e.id === value);
  const displayValue = selectedEquipment 
    ? selectedEquipment.name
    : "Selecione um equipamento";
    
  const isSelected = !!selectedEquipment;

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isPopoverOpen}
            className="w-full justify-between uppercase"
            disabled={disabled}
          >
            <span className={cn(
                "truncate",
                isSelected ? "font-bold text-foreground" : "text-muted-foreground"
            )}>
                {displayValue}
            </span>
            <PlusCircle className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Buscar equipamento..." />
            <CommandList>
              <CommandEmpty className="uppercase">Nenhum equipamento encontrado.</CommandEmpty>
              <CommandGroup>
                {equipments.map((equipment) => (
                  <CommandItem
                    key={equipment.id}
                    value={`${equipment.name} ${equipment.brand || ''} ${equipment.model || ''}`}
                    onSelect={() => handleSelectChange(equipment.id)}
                    className="uppercase"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === equipment.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {equipment.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup>
                <CommandItem
                  key="NEW_EQUIPMENT"
                  value="Adicionar Novo Equipamento"
                  onSelect={() => handleSelectChange("NEW_EQUIPMENT")}
                  className="text-primary font-medium cursor-pointer uppercase"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Novo Equipamento
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="uppercase">Adicionar Novo Equipamento</DialogTitle>
          </DialogHeader>
          <EquipmentForm 
            clientId={clientId}
            onSubmit={handleNewEquipmentSubmit} 
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EquipmentSelector;