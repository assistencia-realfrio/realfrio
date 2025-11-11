import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "./ClientForm";
import { showSuccess, showError } from "@/utils/toast";
import { useClients, Client } from "@/hooks/useClients"; // Usando useClients (o hook unificado)
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
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientSelectorProps {
  value: string; // Deve ser o ID do cliente
  onChange: (clientId: string) => void;
  disabled?: boolean; // Adicionando a prop disabled
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ value, onChange, disabled = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { clients, isLoading: isLoadingClients, createClient } = useClients(); // Usando useClients

  // Mapeia o ID para o nome para exibir no SelectValue
  const selectedClient = clients.find(c => c.id === value);
  const selectedClientName = selectedClient?.name || "";

  const handleNewClientSubmit = async (data: ClientFormValues) => {
    try {
        const newClient = await createClient.mutateAsync(data);
        
        onChange(newClient.id);
        
        setIsModalOpen(false);
        showSuccess(`NOVO CLIENTE '${data.name}' CRIADO COM SUCESSO!`);
    } catch (error) {
        console.error("Erro ao criar cliente:", error);
        showError("ERRO AO CRIAR NOVO CLIENTE. TENTE NOVAMENTE.");
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
            {(selectedClientName || "SELECIONE OU ADICIONE UM CLIENTE").toUpperCase()}
            <UserPlus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="BUSCAR CLIENTE..." />
            <CommandList>
              <CommandEmpty>NENHUM CLIENTE ENCONTRADO.</CommandEmpty>
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
                    {client.name.toUpperCase()}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup>
                <CommandItem
                  key="NEW_CLIENT"
                  value="Adicionar Novo Cliente"
                  onSelect={() => handleSelectChange("NEW_CLIENT")}
                  className="text-primary font-medium cursor-pointer"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  ADICIONAR NOVO CLIENTE
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Modal de Criação de Cliente */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ADICIONAR NOVO CLIENTE</DialogTitle>
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