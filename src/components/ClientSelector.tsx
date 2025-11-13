import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { useClients, Client } from "@/hooks/useClients"; 
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
import ClientForm, { ClientFormValues } from "./ClientForm"; 

interface ClientSelectorProps {
  value: string; // Deve ser o ID do cliente
  onChange: (clientId: string) => void;
  disabled?: boolean; // Adicionando a prop disabled
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ value, onChange, disabled = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // NOVO: Estado para o termo de busca
  const { clients, isLoading: isLoadingClients, createClient } = useClients(); 

  // Mapeia o ID para o nome para exibir no SelectValue
  const selectedClient = clients.find(c => c.id === value);
  const selectedClientName = selectedClient?.name || "";

  const handleNewClientSubmit = async (data: ClientFormValues) => {
    try {
        const newClient = await createClient.mutateAsync(data);
        
        onChange(newClient.id);
        
        setIsModalOpen(false);
        setSearchTerm(""); // Limpa o termo de busca após a criação
        showSuccess(`Novo cliente '${data.name}' criado com sucesso!`);
    } catch (error) {
        console.error("Erro ao criar cliente:", error);
        showError("Erro ao criar novo cliente. Tente novamente.");
    }
  };

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "CREATE_NEW_CLIENT_DYNAMIC") { 
      setIsModalOpen(true);
    } else {
      const selectedClient = clients.find(c => c.id === selectedValue);
      if (selectedClient) {
        onChange(selectedClient.id);
        setIsPopoverOpen(false); // Fecha o popover após a seleção
        setSearchTerm(""); // Limpa o termo de busca
      }
    }
  };

  if (isLoadingClients) {
    return <Skeleton className="h-10 w-full" />;
  }

  const displayValue = selectedClientName || "Selecione ou adicione um cliente";

  // Prepara os dados iniciais para o formulário de criação, se houver um termo de busca
  const initialClientData: ClientFormValues | undefined = searchTerm.trim() ? {
    name: searchTerm.trim(),
    contact: "",
    email: "",
    store: "CALDAS DA RAINHA",
    maps_link: "",
    locality: "",
    google_drive_link: "",
  } : undefined;

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
            {displayValue}
            <UserPlus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {searchTerm.trim() ? (
                  <CommandItem
                    key="CREATE_NEW_CLIENT_DYNAMIC"
                    // Usamos um valor que não será filtrado pelo Command, mas que podemos usar para seleção
                    value={`Criar Novo Cliente: ${searchTerm}`} 
                    onSelect={() => handleSelectChange("CREATE_NEW_CLIENT_DYNAMIC")}
                    className="text-primary font-medium cursor-pointer justify-center text-center py-3"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar Cliente: <span className="font-bold ml-1 truncate">{searchTerm}</span>
                  </CommandItem>
                ) : (
                  <span>Nenhum cliente encontrado.</span> // ENVOLVIDO EM SPAN
                )}
              </CommandEmpty>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm 
            onSubmit={handleNewClientSubmit} 
            onCancel={() => setIsModalOpen(false)}
            initialData={initialClientData} // Passa o nome pesquisado
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientSelector;