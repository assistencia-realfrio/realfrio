import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ClientTable, { Client } from "@/components/ClientTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "@/components/ClientForm";

const Clients: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientFormValues | undefined>(undefined);

  const handleNewClient = () => {
    setEditingClient(undefined);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient({
      name: client.name,
      contact: client.contact,
      email: client.email,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: ClientFormValues) => {
    console.log("Dados do Cliente submetidos:", data);
    // Aqui você faria a lógica de salvar/atualizar o cliente
    setIsModalOpen(false);
    // Nota: A tabela ClientTable precisará ser atualizada para receber um prop de callback para edição/criação real.
  };

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
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingClient ? "Editar Cliente" : "Criar Novo Cliente"}</DialogTitle>
              </DialogHeader>
              <ClientForm 
                initialData={editingClient} 
                onSubmit={handleFormSubmit} 
                onCancel={() => setIsModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou contato..." className="pl-10" />
          </div>
        </div>

        {/* Tabela de Clientes - Passando o callback de edição */}
        <ClientTable onEdit={handleEditClient} />
      </div>
    </Layout>
  );
};

export default Clients;