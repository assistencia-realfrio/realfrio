import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ClientTable, { Client } from "@/components/ClientTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Importação de DialogTrigger adicionada
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientForm, { ClientFormValues } from "@/components/ClientForm";
import ClientOrdersTab from "@/components/ClientOrdersTab";
import ClientEquipmentTab from "@/components/ClientEquipmentTab"; // Importar o novo componente
import { useClients } from "@/hooks/useClients";
import { showSuccess, showError } from "@/utils/toast";

// Tipo para o cliente que está sendo editado (pode ser undefined para criação)
type EditableClient = Client | undefined;

const Clients: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<EditableClient>(undefined);
  const [activeTab, setActiveTab] = useState("details");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { createClient, updateClient } = useClients();

  const handleNewClient = () => {
    setEditingClient(undefined);
    setActiveTab("details");
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setActiveTab("details");
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
    contact: editingClient.contact,
    email: editingClient.email,
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
                  {isEditing ? `Editar Cliente: ${editingClient.name}` : "Criar Novo Cliente"}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full" style={{ gridTemplateColumns: isEditing ? 'repeat(3, 1fr)' : '1fr' }}>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  {isEditing && <TabsTrigger value="orders">Ordens de Serviço</TabsTrigger>}
                  {isEditing && <TabsTrigger value="equipments">Equipamentos</TabsTrigger>} {/* Novo Tab Trigger */}
                </TabsList>

                <TabsContent value="details" className="mt-4">
                  <ClientForm 
                    initialData={initialFormData} 
                    onSubmit={handleFormSubmit} 
                    onCancel={() => setIsModalOpen(false)}
                  />
                </TabsContent>

                {isEditing && (
                  <TabsContent value="orders" className="mt-4">
                    <ClientOrdersTab clientId={editingClient.id} />
                  </TabsContent>
                )}

                {isEditing && (
                  <TabsContent value="equipments" className="mt-4"> {/* Novo Tab Content */}
                    <ClientEquipmentTab clientId={editingClient.id} />
                  </TabsContent>
                )}
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
                placeholder="Buscar por nome ou contato..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabela de Clientes - Passando o callback de edição e o termo de busca */}
        <ClientTable onEdit={handleEditClient} searchTerm={searchTerm} />
      </div>
    </Layout>
  );
};

export default Clients;