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
import EquipmentForm from "./EquipmentForm"; // Importando o formulário de equipamento reutilizável

interface EquipmentSelectorProps {
  clientId: string;
  value: string; // Deve ser o ID do equipamento
  onChange: (equipmentId: string, equipmentDetails: { name: string, brand: string | null, model: string | null, serial_number: string | null }) => void;
  disabled?: boolean; // Adicionando a prop disabled
}

const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({ clientId, value, onChange, disabled = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { equipments, isLoading } = useEquipments(clientId);

  // Efeito para pré-selecionar o equipamento se houver apenas um, ou se o valor atual for inválido
  useEffect(() => {
    if (equipments.length > 0 && !value) {
        const firstEquipment = equipments[0];
        onChange(firstEquipment.id, { 
            name: firstEquipment.name, 
            brand: firstEquipment.brand, // Incluindo a marca
            model: firstEquipment.model, 
            serial_number: firstEquipment.serial_number 
        });
    }
  }, [equipments, value, onChange]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "NEW_EQUIPMENT") {
      setIsModalOpen(true);
    } else {
      const selectedEquipment = equipments.find(e => e.id === selectedValue);
      if (selectedEquipment) {
        onChange(selectedEquipment.id, {
            name: selectedEquipment.name,
            brand: selectedEquipment.brand, // Incluindo a marca
            model: selectedEquipment.model,
            serial_number: selectedEquipment.serial_number,
        });
        setIsPopoverOpen(false); // Fecha o popover após a seleção
      }
    }
  };
  
  const handleNewEquipmentSubmit = (newEquipment: Equipment) => {
    // Seleciona o novo equipamento criado
    onChange(newEquipment.id, {
        name: newEquipment.name,
        brand: newEquipment.brand, // Incluindo a marca
        model: newEquipment.model,
        serial_number: newEquipment.serial_number,
    });
    setIsModalOpen(false);
  };

  // Se o cliente não estiver selecionado, não mostra o seletor
  if (!clientId) {
    return (
        <Button
            variant="outline"
            role="combobox"
            disabled
            className="w-full justify-between text-muted-foreground"
        >
            SELECIONE UM CLIENTE PRIMEIRO
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
    : "SELECIONE OU ADICIONE UM EQUIPAMENTO";

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isPopoverOpen}
            className="w-full justify-between"
            disabled={disabled} // Aplica a prop disabled aqui
          >
            {displayValue.toUpperCase()}
            <PlusCircle className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="BUSCAR EQUIPAMENTO..." />
            <CommandList>
              <CommandEmpty>NENHUM EQUIPAMENTO ENCONTRADO.</CommandEmpty>
              <CommandGroup>
                {equipments.map((equipment) => (
                  <CommandItem
                    key={equipment.id}
                    // Usamos uma string combinada para que a busca funcione em nome, marca e modelo
                    value={`${equipment.name} ${equipment.brand || ''} ${equipment.model || ''}`}
                    onSelect={() => handleSelectChange(equipment.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === equipment.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {equipment.name.toUpperCase()}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup>
                <CommandItem
                  key="NEW_EQUIPMENT"
                  value="Adicionar Novo Equipamento"
                  onSelect={() => handleSelectChange("NEW_EQUIPMENT")}
                  className="text-primary font-medium cursor-pointer"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  ADICIONAR NOVO EQUIPAMENTO
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Modal de Criação de Equipamento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ADICIONAR NOVO EQUIPAMENTO</DialogTitle>
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