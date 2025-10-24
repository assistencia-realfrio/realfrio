import React, { useState, useMemo } from "react";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceOrderCard from "@/components/ServiceOrderCard";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
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

// Dados mock
const mockOrders: ServiceOrder[] = [
  { id: "OS-001", title: "Reparo de Ar Condicionado", client: "Empresa A", status: "Em Progresso", priority: "Alta", store: "CALDAS DA RAINHA", date: "2024-10-27" },
  { id: "OS-002", title: "Instalação de Rede", client: "Cliente B", status: "Pendente", priority: "Média", store: "PORTO DE MÓS", date: "2024-10-28" },
  { id: "OS-003", title: "Manutenção Preventiva", client: "Indústria C", status: "Concluída", priority: "Baixa", store: "CALDAS DA RAINHA", date: "2024-10-26" },
  { id: "OS-004", title: "Substituição de Peça", client: "Loja D", status: "Pendente", priority: "Alta", store: "PORTO DE MÓS", date: "2024-10-29" },
  { id: "OS-005", title: "Configuração de Servidor", client: "Empresa A", status: "Em Progresso", priority: "Média", store: "CALDAS DA RAINHA", date: "2024-10-30" },
];


const ServiceOrders: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<StoreFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState("");

  const handleNewOrder = () => {
    navigate("/orders/new");
  };

  const filteredOrders = useMemo(() => {
    let orders = mockOrders;

    // 1. Filtrar por Loja
    if (selectedStore !== 'ALL') {
      orders = orders.filter(order => order.store === selectedStore);
    }

    // 2. Filtrar por Termo de Busca
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

        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
          {/* Filtro de Loja */}
          <div className="w-full md:w-64">
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
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredOrders.map((order) => (
            <ServiceOrderCard key={order.id} order={order} />
          ))}
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma ordem de serviço encontrada para os filtros aplicados.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ServiceOrders;