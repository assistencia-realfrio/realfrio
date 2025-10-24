import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Clients: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h2>
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou contato..." className="pl-10" />
          </div>
        </div>

        <div className="py-12 text-center border-2 border-dashed p-8 rounded-lg text-muted-foreground">
            <p className="text-lg font-semibold mb-2">Em Construção</p>
            <p>A listagem e gestão de clientes será implementada aqui.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Clients;