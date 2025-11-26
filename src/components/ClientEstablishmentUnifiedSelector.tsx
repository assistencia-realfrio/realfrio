import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { UserPlus, Check, Building } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "./ClientForm";
import { showSuccess, showError } from "@/utils/toast";
import { useClients } from "@/hooks/useClients";
import { useAllEstablishments, EstablishmentWithClient } from "@/hooks/useAllEstablishments";
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
import { Client } from "@/hooks/useClients";

interface SelectionResult {
    clientId: string;
    clientName: string;
    establishmentId: string | null;
    establishmentName: string | null;
}

interface ClientEstablishmentUnifiedSelectorProps {
  value: string; // Deve ser o ID do cliente
  establishmentValue: string | null; // Deve ser o ID do estabelecimento
  onChange: (result: SelectionResult) => void;
  disabled?: boolean;
}

const ClientEstablishmentUnifiedSelector: React.FC<ClientEstablishmentUnifiedSelectorProps> = ({ 
    value: selectedClientId, 
    establishmentValue: selectedEstablishmentId, 
    onChange, 
    disabled = false 
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { clients, isLoading: isLoadingClients } = useClients();
  const { establishments, isLoading: isLoadingEstablishments } = useAllEstablishments();
  const navigate = useNavigate(); // Inicializar useNavigate

  const isLoading = isLoadingClients || isLoadingEstablishments;

  // Combina clientes e estabelecimentos para a busca
  const searchItems = useMemo(() => {
    const clientItems = clients.map(c => ({
        type: 'client',
        id: c.id,
        name: c.name,
        clientId: c.id,
        clientName: c.name,
        establishmentId: null,
        establishmentName: null,
        searchKey: `cliente ${c.name} ${c.billing_name || ''} ${c.locality || ''} ${c.contact || ''}`, // Adicionado billing_name
    }));

    const establishmentItems = establishments.map(e => ({
        type: 'establishment',
        id: e.id,
        name: `${e.name} (${e.client_name})`,
        clientId: e.client_id,
        clientName: e.client_name,
        establishmentId: e.id,
        establishmentName: e.name,
        searchKey: `estabelecimento ${e.name} ${e.client_name} ${e.locality || ''} ${e.phone || ''}`,
    }));

    return [...clientItems, ...establishmentItems];
  }, [clients, establishments]);

  // Determina o valor de exibição
  const displayValue = useMemo(() => {
    if (selectedEstablishmentId) {
        const est = establishments.find(e => e.id === selectedEstablishmentId);
        return est ? `${est.client_name} - ${est.name}` : "Selecionar cliente";
    }
    if (selectedClientId) {
        const client = clients.find(c => c.id === selectedClientId);
        return client ? client.name : "Selecionar cliente";
    }
    return "Selecionar cliente";
  }, [selectedClientId, selectedEstablishmentId, clients, establishments]);

  const handleSelectChange = (item: typeof searchItems[0]) => {
    onChange({
        clientId: item.clientId,
        clientName: item.clientName,
        establishmentId: item.establishmentId,
        establishmentName: item.establishmentName,
    });
    setIsPopoverOpen(false);
  };

  const handleNewClientClick = () => {
    setIsPopoverOpen(false); // Fecha o popover
    navigate("/clients/new"); // Navega para a página de criação de cliente
  };

  if (isLoading) {
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
            disabled={disabled}
          >
            <span className={cn(
                "truncate",
                selectedClientId ? "font-bold text-foreground" : "text-muted-foreground"
            )}>
                {displayValue}
            </span>
            <UserPlus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command
            filter={(itemValue, search) => {
              // Filtra pelo valor do item (que é a chave de busca)
              return itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
            }}
          >
            <CommandInput placeholder="Buscar cliente ou estabelecimento..." />
            <CommandList>
              <CommandEmpty>Nenhum cliente ou estabelecimento encontrado.</CommandEmpty>
              
              {/* Opção para Adicionar Novo Cliente */}
              <CommandGroup>
                <CommandItem
                  key="NEW_CLIENT"
                  value="Adicionar Novo Cliente"
                  onSelect={handleNewClientClick} // Usa a nova função de navegação
                  className="text-primary font-medium cursor-pointer"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Novo Cliente
                </CommandItem>
              </CommandGroup>

              {/* Clientes e Estabelecimentos existentes */}
              <CommandGroup heading="Resultados">
                {searchItems.map((item) => (
                  <CommandItem
                    key={`${item.type}-${item.id}`}
                    value={item.searchKey}
                    onSelect={() => handleSelectChange(item)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedClientId === item.clientId && selectedEstablishmentId === item.establishmentId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.type === 'establishment' ? (
                        <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{item.name}</span>
                        </div>
                    ) : (
                        <span className="truncate">{item.name}</span>
                    )}
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

export default ClientEstablishmentUnifiedSelector;