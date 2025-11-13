import React, { useState } from "react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { clients, isLoading: isLoadingClients, createClient } = useClients();

  // Mapeia o ID para o nome para exibir no SelectValue
  const selectedClient = clients.find(c => c.id === value);
  const selectedClientName = selectedClient?.name || "";

  const handleNewClientSubmit = async (data: ClientFormValues) => {
    try {
        const newClient = await createClient.mutateAsync(data);
        
        onChange(newClient.id);
        
        setIsModalOpen(false);
        showSuccess(`Novo cliente '${data.name}' criado com sucesso!`);
    } catch (error) {
        console.error("Erro ao criar cliente:", error);
        showError("Erro ao criar novo cliente. Tente novamente.");
    }
  };

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "NEW_CLIENT") {
      setIsModalOpen(true);
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
            {selectedClientName || "Selecione ou adicione um cliente"}
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
              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
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

      {/* Modal de Criação de Cliente */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm 
            onSubmit={handleNewClientSubmit} 
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientSelector;