import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building, Check, PlusCircle } from "lucide-react";
import { useClientEstablishments, Establishment, EstablishmentFormValues } from "@/hooks/useClientEstablishments";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EstablishmentForm from "./EstablishmentForm";
import { showSuccess, showError } from "@/utils/toast";

interface EstablishmentSelectorProps {
  clientId: string;
  value: string | null; // establishment_id
  onChange: (establishmentId: string | null, establishmentName: string | null) => void;
  disabled?: boolean;
}

const EstablishmentSelector: React.FC<EstablishmentSelectorProps> = ({ clientId, value, onChange, disabled = false }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { establishments, isLoading, createEstablishment } = useClientEstablishments(clientId);

  const handleSelectChange = (establishmentId: string | null) => {
    if (establishmentId === "NEW_ESTABLISHMENT") {
      setIsModalOpen(true);
      return;
    }
    
    const selected = establishments.find(e => e.id === establishmentId);
    onChange(selected ? selected.id : null, selected ? selected.name : null);
    setIsPopoverOpen(false);
  };
  
  const handleNewEstablishmentSubmit = async (data: EstablishmentFormValues) => {
    try {
      const newEstablishment = await createEstablishment.mutateAsync(data);
      
      onChange(newEstablishment.id, newEstablishment.name);
      
      setIsModalOpen(false);
      showSuccess(`Novo estabelecimento '${newEstablishment.name}' criado com sucesso!`);
    } catch (error) {
      console.error("Erro ao criar estabelecimento:", error);
      showError("Erro ao criar novo estabelecimento. Tente novamente.");
    }
  };

  if (!clientId) {
    return (
      <Button
        variant="outline"
        role="combobox"
        disabled
        className="w-full justify-between text-muted-foreground"
      >
        Selecione um cliente primeiro
        <Building className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  // Alterado o texto padrão
  const defaultPlaceholder = "Escolher Estabelecimento";
  const selectedEstablishment = establishments.find(e => e.id === value);
  const displayValue = selectedEstablishment?.name || defaultPlaceholder;

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isPopoverOpen}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className={cn("truncate", value ? "text-foreground" : "text-muted-foreground")}>
              {establishments.length === 0 && !value ? "Nenhum estabelecimento registado" : displayValue}
            </span>
            <Building className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Buscar estabelecimento..." />
            <CommandList>
              <CommandEmpty>Nenhum estabelecimento encontrado.</CommandEmpty>
              <CommandGroup>
                <CommandItem onSelect={() => handleSelectChange(null)}>
                  <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
                  Nenhum (Serviço na Sede)
                </CommandItem>
                {establishments.map((est) => (
                  <CommandItem
                    key={est.id}
                    value={est.name}
                    onSelect={() => handleSelectChange(est.id)}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === est.id ? "opacity-100" : "opacity-0")} />
                    {est.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup>
                <CommandItem
                  key="NEW_ESTABLISHMENT"
                  value="Adicionar Novo Estabelecimento"
                  onSelect={() => handleSelectChange("NEW_ESTABLISHMENT")}
                  className="text-primary font-medium cursor-pointer"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Novo Estabelecimento
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Modal de Criação de Estabelecimento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Estabelecimento</DialogTitle>
          </DialogHeader>
          <EstablishmentForm 
            clientId={clientId}
            onSubmit={handleNewEstablishmentSubmit} 
            onCancel={() => setIsModalOpen(false)}
            isPending={createEstablishment.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EstablishmentSelector;