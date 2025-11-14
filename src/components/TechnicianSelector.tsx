import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, User } from "lucide-react";
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
import { useTechnicians } from "@/hooks/useTechnicians";

interface TechnicianSelectorProps {
  value: string | null; // Deve ser o ID do técnico (UUID)
  onChange: (technicianId: string | null) => void;
  disabled?: boolean;
}

const TechnicianSelector: React.FC<TechnicianSelectorProps> = ({ value, onChange, disabled = false }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { technicians, isLoading } = useTechnicians();

  const selectedTechnician = technicians.find(t => t.id === value);
  
  const getFullName = (t: { first_name: string | null, last_name: string | null }) => {
    return `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Usuário Desconhecido';
  };

  const displayValue = selectedTechnician 
    ? getFullName(selectedTechnician)
    : "Selecione um técnico (Opcional)";
    
  const isSelected = !!selectedTechnician;

  const handleSelectChange = (selectedValue: string) => {
    // Se o valor for 'NONE', significa desmarcar o técnico
    const newId = selectedValue === "NONE" ? null : selectedValue;
    onChange(newId);
    setIsPopoverOpen(false);
  };

  if (isLoading) {
    return (
        <Button
            variant="outline"
            role="combobox"
            disabled
            className="w-full justify-between text-muted-foreground"
        >
            Carregando técnicos...
            <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
    );
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isPopoverOpen}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className={cn(
              "truncate",
              isSelected ? "font-bold text-foreground" : "text-muted-foreground"
          )}>
              {displayValue}
          </span>
          <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar técnico..." />
          <CommandList>
            <CommandEmpty>Nenhum técnico encontrado.</CommandEmpty>
            
            {/* Opção para desmarcar */}
            <CommandGroup>
                <CommandItem
                    key="NONE"
                    value="Nenhum Técnico"
                    onSelect={() => handleSelectChange("NONE")}
                    className="text-muted-foreground cursor-pointer"
                >
                    <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            !value ? "opacity-100" : "opacity-0"
                        )}
                    />
                    Nenhum Técnico (Opcional)
                </CommandItem>
            </CommandGroup>

            {/* Técnicos existentes */}
            <CommandGroup heading="Técnicos Disponíveis">
              {technicians.map((technician) => (
                <CommandItem
                  key={technician.id}
                  value={getFullName(technician)}
                  onSelect={() => handleSelectChange(technician.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === technician.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {getFullName(technician)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default TechnicianSelector;