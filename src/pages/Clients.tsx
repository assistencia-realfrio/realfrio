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
import ClientOrdersTab from "@/components/ClientOrdersTab";
import ClientEquipmentTab from "@/components/ClientEquipmentTab";
import { useClients } from "@/hooks/useClients";
import { showSuccess, showError } from "@/utils/toast";

// Tipo para o cliente que está sendo editado (pode ser undefined para criação)
type EditableClient = Client | undefined;
type StoreFilter = Client['store'] | 'ALL'; // Tipo para o filtro de loja

const Clients: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<EditableClient>(undefined);
  const [activeView, setActiveView] = useState<"details" | "orders" | "equipments">("details");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreFilter>('ALL'); // Novo estado para o filtro de loja
  
  const { createClient, updateClient } = useClients(searchTerm, selectedStore); // Passando o filtro de loja

  const handleNewClient = () => {
    setEditingClient(undefined);
    setActiveView("details");
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setActiveView("details");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: ClientFormValues) => {
    try {
        if (editingClient) {
            // Atualizar
            await updateClient.mutateAsync({ id: editingClient.id, ...data });
            showSuccess(`Cliente ${data.name} atualizado com sucesso!`);
        } else {
            // Criar
            await createClient.mutateAsync(data);
            showSuccess(`Cliente ${data.name} criado com sucesso!`);
        }
        setIsModalOpen(false);
    } catch (error) {
        console.error("Erro ao salvar cliente:", error);
        showError("Erro ao salvar cliente. Verifique os dados.");
    }
  };

  const initialFormData = editingClient ? {
    name: editingClient.name,
    contact: editingClient.contact || "", // Garante string vazia para o formulário
    email: editingClient.email || "",     // Garante string vazia para o formulário
    store: editingClient.store || "CALDAS DA RAINHA", // Garante um valor padrão
  } : undefined;

  const isEditing = !!editingClient;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h2>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto" onClick={handleNewClient}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? `Editar Cliente: ${editingClient?.name}` : "Criar Novo Cliente"}
                </DialogTitle>
              </DialogHeader>
              
              {/* Select para navegação entre as seções do cliente */}
              <div className="w-full">
                <Select value={activeView} onValueChange={(value: "details" | "orders" | "equipments") => setActiveView(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a seção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="details">Detalhes</SelectItem>
                    {isEditing && <SelectItem value="orders">Ordens de Serviço</SelectItem>}
                    {isEditing && <SelectItem value="equipments">Equipamentos</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              {/* Conteúdo baseado na seleção */}
              {activeView === "details" && (
                <div className="mt-4">
                  <ClientForm 
                    initialData={initialFormData} 
                    onSubmit={handleFormSubmit} 
                    onCancel={() => setIsModalOpen(false)}
                  />
                </div>
              )}

              {isEditing && activeView === "orders" && (
                <div className="mt-4">
                  <ClientOrdersTab clientId={editingClient!.id} />
                </div>
              )}

              {isEditing && activeView === "equipments" && (
                <div className="mt-4">
                  <ClientEquipmentTab clientId={editingClient!.id} />
                </div>
              )}
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

        {/* Tabela de Clientes - Passando o callback de edição e o termo de busca */}
        <ClientTable onEdit={handleEditClient} searchTerm={searchTerm} storeFilter={selectedStore} />
      </div>
    </Layout>
  );
};

export default Clients;