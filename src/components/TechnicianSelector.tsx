import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, User, XCircle } from "lucide-react";
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
import { useTechnicians } from "@/hooks/useTechnicians";

interface TechnicianSelectorProps {
  value: string | null; // ID do técnico (UUID)
  onChange: (technicianId: string | null) => void;
  disabled?: boolean;
}

const TechnicianSelector: React.FC<TechnicianSelectorProps> = ({ value, onChange, disabled = false }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { data: technicians = [], isLoading } = useTechnicians();

  const selectedTechnician = technicians.find(t => t.id === value);
  const displayValue = selectedTechnician?.full_name || "Atribuir Técnico (Opcional)";

  const handleSelectChange = (technicianId: string) => {
    onChange(technicianId);
    setIsPopoverOpen(false);
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setIsPopoverOpen(false);
  };

  if (isLoading) {
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
          <div className="flex items-center truncate">
            <User className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">{displayValue}</span>
          </div>
          
          {value && (
            <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={handleClear}
                className="h-6 w-6 p-0 ml-2 text-destructive hover:bg-destructive/10"
                aria-label="Limpar Técnico"
            >
                <XCircle className="h-4 w-4" />
            </Button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar técnico..." />
          <CommandList>
            <CommandEmpty>Nenhum técnico encontrado.</CommandEmpty>
            <CommandGroup>
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