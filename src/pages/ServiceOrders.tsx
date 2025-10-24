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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
type StatusFilter = ServiceOrder['status'] | 'ALL';

// Dados mock
const mockOrders: ServiceOrder[] = [
  { id: "OS-001", title: "Reparo de Ar Condicionado", client: "Empresa Alpha Soluções", status: "Em Progresso", priority: "Alta", store: "CALDAS DA RAINHA", date: "2024-10-27" },
  { id: "OS-002", title: "Instalação de Rede", client: "Cliente Beta Individual", status: "Pendente", priority: "Média", store: "PORTO DE MÓS", date: "2024-10-28" },
  { id: "OS-003", title: "Manutenção Preventiva", client: "Empresa Alpha Soluções", status: "Concluída", priority: "Baixa", store: "CALDAS DA RAINHA", date: "2024-10-26" },
  { id: "OS-004", title: "Substituição de Peça", client: "Loja Delta Varejo", status: "Pendente", priority: "Alta", store: "PORTO DE MÓS", date: "2024-10-29" },
  { id: "OS-005", title: "Configuração de Servidor", client: "Empresa Alpha Soluções", status: "Em Progresso", priority: "Média", store: "CALDAS DA RAINHA", date: "2024-10-30" },
  { id: "OS-006", title: "Revisão Geral", client: "Cliente Beta Individual", status: "Pendente", priority: "Baixa", store: "PORTO DE MÓS", date: "2024-11-01" },
  { id: "OS-007", title: "OS Cancelada", client: "Indústria Gama Pesada", status: "Cancelada", priority: "Baixa", store: "CALDAS DA RAINHA", date: "2024-11-02" },
  { id: "OS-008", title: "Reparo Urgente de Eletricidade", client: "Empresa Alpha Soluções", status: "Pendente", priority: "Alta", store: "CALDAS DA RAINHA", date: "2024-11-03" },
  { id: "OS-009", title: "Instalação de Software", client: "Cliente Beta Individual", status: "Concluída", priority: "Média", store: "PORTO DE MÓS", date: "2024-11-04" },
  { id: "OS-010", title: "Limpeza de Equipamento", client: "Loja Delta Varejo", status: "Concluída", priority: "Baixa", store: "CALDAS DA RAINHA", date: "2024-11-05" },
];

const ServiceOrders: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<StoreFilter>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL'); // Novo estado para status
  const [searchTerm, setSearchTerm] = useState("");

  const handleNewOrder = () => {
    navigate("/orders/new");
  };

  const sortedAndFilteredOrders = useMemo(() => {
    // 1. Ordenar por data (mais recente primeiro)
    const sortedOrders = [...mockOrders].sort((a, b) => {
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;
      return 0;
    });

    let orders = sortedOrders;

    // 2. Filtrar por Termo de Busca
    if (searchTerm.trim()) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      orders = orders.filter(order => 
        order.id.toLowerCase().includes(lowerCaseSearch) ||
        order.client.toLowerCase().includes(lowerCaseSearch) ||
        order.title.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // 3. Filtrar por Status
    if (selectedStatus !== 'ALL') {
      orders = orders.filter(order => order.status === selectedStatus);
    }

    return orders;
  }, [selectedStatus, searchTerm]);

  const renderOrderGrid = (orders: ServiceOrder[]) => {
    // Filtragem final por loja, se necessário
    const finalOrders = selectedStore === 'ALL' 
      ? orders 
      : orders.filter(order => order.store === selectedStore);

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {finalOrders.map((order) => (
          <ServiceOrderCard key={order.id} order={order} />
        ))}
        {finalOrders.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhuma ordem de serviço encontrada para os filtros aplicados.
          </div>
        )}
      </div>
    );
  };

  // Recalculando os totais para as abas com base nos filtros de busca e status
  const ordersForTabs = sortedAndFilteredOrders;
  const allOrdersCount = ordersForTabs.length;
  const caldasOrdersCount = ordersForTabs.filter(o => o.store === 'CALDAS DA RAINHA').length;
  const portoOrdersCount = ordersForTabs.filter(o => o.store === 'PORTO DE MÓS').length;


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

        {/* Filtros de Busca e Status */}
        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
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
          
          {/* Filtro de Status */}
          <div className="w-full md:w-48">
            <Select 
              onValueChange={(value: StatusFilter) => setSelectedStatus(value)} 
              defaultValue={selectedStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em Progresso">Em Progresso</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Abas de Loja */}
        <Tabs value={selectedStore} onValueChange={(value) => setSelectedStore(value as StoreFilter)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ALL">Todas ({allOrdersCount})</TabsTrigger>
            <TabsTrigger value="CALDAS DA RAINHA">Caldas da Rainha ({caldasOrdersCount})</TabsTrigger>
            <TabsTrigger value="PORTO DE MÓS">Porto de Mós ({portoOrdersCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="ALL" className="mt-6">
            {renderOrderGrid(ordersForTabs)}
          </TabsContent>
          
          <TabsContent value="CALDAS DA RAINHA" className="mt-6">
            {renderOrderGrid(ordersForTabs)}
          </TabsContent>

          <TabsContent value="PORTO DE MÓS" className="mt-6">
            {renderOrderGrid(ordersForTabs)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ServiceOrders;