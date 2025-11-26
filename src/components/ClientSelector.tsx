import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { UserPlus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "./ClientForm";
import { showSuccess, showError } from "@/utils/toast";
import { useClients } from "@/hooks/useClients";
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

interface ClientSelectorProps {
  value: string; // Deve ser o ID do cliente
  onChange: (clientId: string) => void;
  disabled?: boolean; // Adicionando a prop disabled
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ value, onChange, disabled = false }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { clients, isLoading: isLoadingClients } = useClients();
  const navigate = useNavigate(); // Inicializar useNavigate

  // Mapeia o ID para o nome para exibir no SelectValue
  const selectedClient = clients.find(c => c.id === value);
  const selectedClientName = selectedClient?.name || "";

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "NEW_CLIENT") {
      navigate("/clients/new"); // Navega para a página de criação de cliente
    } else {
      onChange(selectedValue);
      setIsPopoverOpen(false); // Fecha o popover após a seleção
    }
  };

  if (isLoadingClients) {
    return <Skeleton className="h-10 w-full" />;
  }

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
            <span className={cn(
                "truncate",
                selectedClientName ? "font-bold text-foreground" : "text-muted-foreground"
            )}>
                {selectedClientName || "Selecione ou adicione um cliente"}
            </span>
            <UserPlus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command
            filter={(itemValue, search) => {
              // Sempre mostrar "Adicionar Novo Cliente"
              if (itemValue === "Adicionar Novo Cliente") return 1;
              // Filtragem padrão para outros itens
              return itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
            }}
          >
            <CommandInput placeholder="Buscar cliente..." />
            <CommandList>
              {/* "Adicionar Novo Cliente" sempre visível e primeiro */}
              <CommandGroup>
                <CommandItem
                  key="NEW_CLIENT"
                  value="Adicionar Novo Cliente"
                  onSelect={() => handleSelectChange("NEW_CLIENT")}
                  className="text-primary font-medium cursor-pointer"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Novo Cliente
                </CommandItem>
              </CommandGroup>
              {/* Clientes existentes */}
              <CommandGroup>
                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.name}
                    onSelect={() => handleSelectChange(client.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === client.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {client.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ClientSelector;