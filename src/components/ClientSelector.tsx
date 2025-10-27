import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "./ClientForm";
import { showSuccess, showError } from "@/utils/toast";
import { useClientNames, useClients } from "@/hooks/useClients";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientSelectorProps {
  value: string; // Deve ser o ID do cliente
  onChange: (clientId: string) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ value, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: clients = [], isLoading: isLoadingClients } = useClientNames();
  const { createClient } = useClients();

  // Mapeia o ID para o nome para exibir no SelectValue
  const selectedClientName = clients.find(c => c.id === value)?.name || "";

  const handleNewClientSubmit = async (data: ClientFormValues) => {
    try {
        // A mutação agora retorna o objeto completo do cliente, incluindo o ID
        const newClient = await createClient.mutateAsync(data);
        
        // Seleciona o novo cliente criado (usando o ID)
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
      // O valor selecionado é o ID do cliente
      onChange(selectedValue);
    }
  };

  if (isLoadingClients) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <>
      <Select onValueChange={handleSelectChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione ou adicione um cliente">
            {selectedClientName}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
          <SelectItem value="NEW_CLIENT" className="text-primary font-medium">
            <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Adicionar Novo Cliente
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Modal de Criação de Cliente */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
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