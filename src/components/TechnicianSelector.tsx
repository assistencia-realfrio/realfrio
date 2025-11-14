import React, { useState } from "react";
import { User, Check } from "lucide-react";
import { useTechnicians } from "@/hooks/useTechnicians";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TechnicianSelectorProps {
  value: string | null; // Deve ser o ID do técnico
  onChange: (technicianId: string | null) => void;
  disabled?: boolean;
}

const TechnicianSelector: React.FC<TechnicianSelectorProps> = ({ value, onChange, disabled = false }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { data: technicians = [], isLoading: isLoadingTechnicians } = useTechnicians();

  // Mapeia o ID para o nome para exibir no SelectValue
  const selectedTechnician = technicians.find(t => t.id === value);
  const selectedTechnicianName = selectedTechnician?.full_name || "";

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "NONE") {
      onChange(null);
    } else {
      onChange(selectedValue);
    }
    setIsPopoverOpen(false);
  };

  if (isLoadingTechnicians) {
    return <Skeleton className="h-10 w-full" />;
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
              selectedTechnicianName ? "font-bold text-foreground" : "text-muted-foreground"
          )}>
              {selectedTechnicianName || "Atribuir Técnico (Opcional)"}
          </span>
          <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar técnico..." />
          <CommandList>
            <CommandEmpty>Nenhum técnico encontrado.</CommandEmpty>
            
            {/* Opção para desatribuir */}
            <CommandGroup>
              <CommandItem
                key="NONE"
                value="Nenhum Técnico Atribuído"
                onSelect={() => handleSelectChange("NONE")}
                className="text-muted-foreground cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                Nenhum Técnico Atribuído
              </CommandItem>
            </CommandGroup>

            {/* Técnicos existentes */}
            <CommandGroup heading="Técnicos">
              {technicians.map((technician) => (
                <CommandItem
                  key={technician.id}
                  value={technician.full_name}
                  onSelect={() => handleSelectChange(technician.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === technician.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {technician.full_name}
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