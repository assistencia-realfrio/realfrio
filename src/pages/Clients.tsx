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

type StoreFilter = Client['store'] | 'ALL';

const Clients: React.FC = () => {
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreFilter>('ALL');
  
  const { createClient } = useClients(searchTerm, selectedStore);

  const handleNewClientSubmit = async (data: ClientFormValues) => {
    try {
        await createClient.mutateAsync(data);
        showSuccess(`CLIENTE ${data.name} CRIADO COM SUCESSO!`);
        setIsNewClientModalOpen(false);
    } catch (error) {
        console.error("Erro ao criar cliente:", error);
        showError("ERRO AO CRIAR CLIENTE. VERIFIQUE OS DADOS.");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">GESTÃO DE CLIENTES</h2>
          
          <Dialog open={isNewClientModalOpen} onOpenChange={setIsNewClientModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto" onClick={() => setIsNewClientModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                NOVO CLIENTE
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>CRIAR NOVO CLIENTE</DialogTitle>
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
                placeholder="BUSCAR POR NOME OU CONTATO..." 
                className="pl-10" 
                value={searchTerm.toUpperCase()}
                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            />
          </div>

          {/* Filtro de Loja */}
          <div className="w-full md:w-48">
            <Select 
              onValueChange={(value: StoreFilter) => setSelectedStore(value)} 
              defaultValue={selectedStore}
            >
              <SelectTrigger>
                <SelectValue placeholder="FILTRAR POR LOJA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">TODAS AS LOJAS</SelectItem>
                <SelectItem value="CALDAS DA RAINHA">CALDAS DA RAINHA</SelectItem>
                <SelectItem value="PORTO DE MÓS">PORTO DE MÓS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ClientTable searchTerm={searchTerm} storeFilter={selectedStore} />
      </div>
    </Layout>
  );
};

export default Clients;