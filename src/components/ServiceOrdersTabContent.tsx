import React, { useState, useMemo } from "react";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceOrderCard from "@/components/ServiceOrderCard";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServiceOrders, ServiceOrder } from "@/hooks/useServiceOrders";
import { Skeleton } from "@/components/ui/skeleton";

type StoreFilter = ServiceOrder['store'] | 'ALL';
type StatusFilter = ServiceOrder['status'] | 'ALL';

const ServiceOrdersTabContent: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<StoreFilter>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState("");
  
  const { orders, isLoading } = useServiceOrders();

  const handleNewOrder = () => {
    navigate("/orders/new");
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // 1. Filtrar por Status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // 2. Filtrar por Termo de Busca
    if (searchTerm.trim()) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.display_id.toLowerCase().includes(lowerCaseSearch) || // Busca pelo novo ID
        order.client.toLowerCase().includes(lowerCaseSearch) ||
        order.equipment.toLowerCase().includes(lowerCaseSearch) ||
        (order.model && order.model.toLowerCase().includes(lowerCaseSearch))
      );
    }
    
    return filtered;
  }, [orders, selectedStatus, searchTerm]);

  const renderOrderGrid = (ordersToRender: ServiceOrder[]) => {
    // Filtragem final por loja, se necessário
    const finalOrders = selectedStore === 'ALL' 
      ? ordersToRender 
      : ordersToRender.filter(order => order.store === selectedStore);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
        );
    }

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
  const allOrdersCount = filteredOrders.length;
  const caldasOrdersCount = filteredOrders.filter(o => o.store === 'CALDAS DA RAINHA').length;
  const portoOrdersCount = filteredOrders.filter(o => o.store === 'PORTO DE MÓS').length;


  return (
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
            placeholder="Buscar por ID, cliente, equipamento ou modelo..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filtro de Estado */}
        <div className="w-full md:w-48">
          <Select 
            onValueChange={(value: StatusFilter) => setSelectedStatus(value)} 
            defaultValue={selectedStatus}
          >
            <SelectTrigger className="border-2 border-primary/70"> {/* Destaque adicionado */}
              <SelectValue placeholder="Filtrar por Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Estados</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Em Progresso">Em Progresso</SelectItem>
              <SelectItem value="Concluída">Concluída</SelectItem>
              <SelectItem value="Cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtro de Loja (agora um Select) */}
      <div className="w-full md:w-48">
        <Select 
          onValueChange={(value: StoreFilter) => setSelectedStore(value)} 
          defaultValue={selectedStore}
        >
          <SelectTrigger className="border-2 border-primary/70"> {/* Destaque adicionado */}
            <SelectValue placeholder="Filtrar por Loja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as Lojas ({allOrdersCount})</SelectItem>
            <SelectItem value="CALDAS DA RAINHA">Caldas da Rainha ({caldasOrdersCount})</SelectItem>
            <SelectItem value="PORTO DE MÓS">Porto de Mós ({portoOrdersCount})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conteúdo das Ordens de Serviço */}
      <div className="mt-6">
        {renderOrderGrid(filteredOrders)}
      </div>
    </div>
  );
};

export default ServiceOrdersTabContent;