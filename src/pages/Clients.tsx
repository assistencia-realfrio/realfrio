import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ClientTable, { Client } from "@/components/ClientTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ClientForm, { ClientFormValues } from "@/components/ClientForm";
import { useClients } from "@/hooks/useClients";
import { showSuccess, showError } from "@/utils/toast";
import ClientDetailsModal from "@/components/ClientDetailsModal"; // Importando o modal de detalhes

type StoreFilter = Client['store'] | 'ALL';

const Clients: React.FC = () => {
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // Novo estado para o modal de detalhes
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreFilter>('ALL');
  
  const { createClient } = useClients(searchTerm, selectedStore); // updateClient não é mais usado aqui

  const handleNewClientSubmit = async (data: ClientFormValues) => {
    try {
        await createClient.mutateAsync(data);
        showSuccess(`Cliente ${data.name} criado com sucesso!`);
        setIsNewClientModalOpen(false);
    } catch (error) {
        console.error("Erro ao criar cliente:", error);
        showError("Erro ao criar cliente. Verifique os dados.");
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };

  // O modal de edição/exclusão agora é gerenciado dentro do ClientDetailsModal,
  // então não precisamos de handleEditClientSubmit ou isEditModalOpen aqui.

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h2>
          
          <Dialog open={isNewClientModalOpen} onOpenChange={setIsNewClientModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto" onClick={() => setIsNewClientModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Cliente</DialogTitle>
              </DialogHeader>
              <ClientForm 
                onSubmit={handleNewClientSubmit} 
                onCancel={() => setIsNewClientModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
          {/* Campo de Busca */}
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
                placeholder="Buscar por nome ou contato..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro de Loja */}
          <div className="w-full md:w-48">
            <Select 
              onValueChange={(value: StoreFilter) => setSelectedStore(value)} 
              defaultValue={selectedStore}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Loja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as Lojas</SelectItem>
                <SelectItem value="CALDAS DA RAINHA">Caldas da Rainha</SelectItem>
                <SelectItem value="PORTO DE MÓS">Porto de Mós</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela de Clientes - Passando o callback de visualização */}
        <ClientTable searchTerm={searchTerm} storeFilter={selectedStore} onView={handleViewClient} />

        {/* Modal de Detalhes do Cliente (inclui edição e exclusão) */}
        <ClientDetailsModal 
            clientId={selectedClient?.id || null} 
            isOpen={isDetailsModalOpen} 
            onOpenChange={setIsDetailsModalOpen} 
        />
      </div>
    </Layout>
  );
};

export default Clients;