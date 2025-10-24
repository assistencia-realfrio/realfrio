import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "./ClientForm";
import { showSuccess } from "@/utils/toast";

// Reutilizando a estrutura de cliente do ClientTable
interface Client {
  id: string;
  name: string;
}

// Mock de clientes existentes (sincronizado com ClientTable.tsx)
const mockClients: Client[] = [
  { id: "C-001", name: "Empresa Alpha Soluções" },
  { id: "C-002", name: "Cliente Beta Individual" },
  { id: "C-003", name: "Indústria Gama Pesada" },
  { id: "C-004", name: "Loja Delta Varejo" },
];

interface ClientSelectorProps {
  value: string;
  onChange: (clientName: string) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ value, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState(mockClients);

  const handleNewClientSubmit = (data: ClientFormValues) => {
    // Simulação de criação de novo cliente
    const newId = `C-${(clients.length + 1).toString().padStart(3, '0')}`;
    const newClient: Client = { id: newId, name: data.name };
    
    setClients([...clients, newClient]);
    
    // Seleciona o novo cliente criado
    onChange(data.name);
    
    setIsModalOpen(false);
    showSuccess(`Novo cliente '${data.name}' criado com sucesso!`);
  };

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "NEW_CLIENT") {
      setIsModalOpen(true);
    } else {
      // O valor selecionado é o nome do cliente
      onChange(selectedValue);
    }
  };

  return (
    <>
      <Select onValueChange={handleSelectChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione ou adicione um cliente" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.name}>
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