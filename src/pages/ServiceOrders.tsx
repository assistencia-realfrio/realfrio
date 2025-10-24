import React, { useState, useMemo } from "react";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceOrderCard from "@/components/ServiceOrderCard";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Definição de tipo para Ordem de Serviço (mantida aqui para mock data)
interface ServiceOrder {
  id: string;
  title: string;
  client: string;
  status: "Pendente" | "Em Progresso" | "Concluída" | "Cancelada";
  priority: "Alta" | "Média" | "Baixa";
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS"; // Novo campo
  date: string;
}

type StoreFilter = ServiceOrder['store'] | 'ALL';

// Dados mock
const mockOrders: ServiceOrder[] = [
  { id: "OS-001", title: "Reparo de Ar Condicionado", client: "Empresa A", status: "Em Progresso", priority: "Alta", store: "CALDAS DA RAINHA", date: "2024-10-27" },
  { id: "OS-002", title: "Instalação de Rede", client: "Cliente B", status: "Pendente", priority: "Média", store: "PORTO DE MÓS", date: "2024-10-28" },
  { id: "OS-003", title: "Manutenção Preventiva", client: "Indústria C", status: "Concluída", priority: "Baixa", store: "CALDAS DA RAINHA", date: "2024-10-26" },
  { id: "OS-004", title: "Substituição de Peça", client: "Loja D", status: "Pendente", priority: "Alta", store: "PORTO DE MÓS", date: "2024-10-29" },
  { id: "OS-005", title: "Configuração de Servidor", client: "Empresa A", status: "Em Progresso", priority: "Média", store: "CALDAS DA RAINHA", date: "2024-10-30" },
  { id: "OS-006", title: "Revisão Geral", client: "Cliente F", status: "Pendente", priority: "Baixa", store: "PORTO DE MÓS", date: "2024-11-01" },
];

const ServiceOrders: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<StoreFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState("");

  const handleNewOrder = () => {
    navigate("/orders/new");
  };

  const sortedAndFilteredOrders = useMemo(() => {
    // 1. Ordenar por data (mais recente primeiro)
    const sortedOrders = [...mockOrders].sort((a, b) => {
      // Assumindo formato YYYY-MM-DD para comparação direta
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;
      return 0;
    });

    let orders = sortedOrders;

    // 2. Filtrar por Loja
    if (selectedStore !== 'ALL') {
      orders = orders.filter(order => order.store === selectedStore);
    }

    // 3. Filtrar por Termo de Busca
    if (searchTerm.trim()) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      orders = orders.filter(order => 
        order.id.toLowerCase().includes(lowerCaseSearch) ||
        order.client.toLowerCase().includes(lowerCaseSearch) ||
        order.title.toLowerCase().includes(lowerCaseSearch)
      );
    }

    return orders;
  }, [selectedStore, searchTerm]);

  const renderOrderGrid = (orders: ServiceOrder[]) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {orders.map((order) => (
        <ServiceOrderCard key={order.id} order={order} />
      ))}
      {orders.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          Nenhuma ordem de serviço encontrada para os filtros aplicados.
        </div>
      )}
    </div>
  );

  const allOrders = sortedAndFilteredOrders.filter(o => selectedStore === 'ALL' || o.store === selectedStore);
  const caldasOrders = sortedAndFilteredOrders.filter(o => o.store === 'CALDAS DA RAINHA');
  const portoOrders = sortedAndFilteredOrders.filter(o => o.store === 'PORTO DE MÓS');


  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button className="w-full sm:w-auto" onClick={handleNewOrder}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova OS
            </Button>
          </div>
        </div>

        {/* Campo de Busca */}
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar por ID, cliente ou título..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Abas de Loja */}
        <Tabs value={selectedStore} onValueChange={(value) => setSelectedStore(value as StoreFilter)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ALL">Todas ({allOrders.length})</TabsTrigger>
            <TabsTrigger value="CALDAS DA RAINHA">Caldas da Rainha ({caldasOrders.length})</TabsTrigger>
            <TabsTrigger value="PORTO DE MÓS">Porto de Mós ({portoOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="ALL" className="mt-6">
            {renderOrderGrid(allOrders)}
          </TabsContent>
          
          <TabsContent value="CALDAS DA RAINHA" className="mt-6">
            {renderOrderGrid(caldasOrders)}
          </TabsContent>

          <TabsContent value="PORTO DE MÓS" className="mt-6">
            {renderOrderGrid(portoOrders)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ServiceOrders;