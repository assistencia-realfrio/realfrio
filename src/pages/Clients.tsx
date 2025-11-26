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
import { useNavigate } from "react-router-dom";

type StoreFilter = Client['store'] | 'ALL';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreFilter>('ALL');
  
  const { createClient } = useClients(searchTerm, selectedStore); 

  const handleNewClientClick = () => {
    navigate("/clients/new");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase">CLIENTES</h2>
        </div>

        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
          {/* Campo de Busca */}
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
                placeholder="Buscar por nome ou contato..." 
                className="pl-10 bg-white" 
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
              <SelectTrigger className="bg-white uppercase"> 
                <SelectValue placeholder="Filtrar por Loja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="uppercase">Todas as Lojas</SelectItem>
                <SelectItem value="CALDAS DA RAINHA" className="uppercase">Caldas da Rainha</SelectItem>
                <SelectItem value="PORTO DE MÓS" className="uppercase">Porto de Mós</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ClientTable searchTerm={searchTerm} storeFilter={selectedStore} />
      </div>
      <Button
        onClick={handleNewClientClick}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
        aria-label="Novo Cliente"
      >
        <PlusCircle className="h-8 w-8" />
      </Button>
    </Layout>
  );
};

export default Clients;