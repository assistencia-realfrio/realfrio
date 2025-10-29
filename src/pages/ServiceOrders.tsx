import React, { useState, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceOrderCard from "@/components/ServiceOrderCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServiceOrders, ServiceOrder, ServiceOrderStatus, serviceOrderStatuses } from "@/hooks/useServiceOrders";
import { Skeleton } from "@/components/ui/skeleton";

type StoreFilter = ServiceOrder['store'] | 'ALL';
type StatusFilter = ServiceOrderStatus | 'ALL';

const ServiceOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Inicializa o estado a partir dos parâmetros da URL, com valores padrão
  const [selectedStore, setSelectedStore] = useState<StoreFilter>(
    (searchParams.get('store') as StoreFilter) || 'ALL'
  );
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>(
    (searchParams.get('status') as StatusFilter) || 'POR INICIAR'
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");
  
  const { orders, isLoading } = useServiceOrders();

  // Efeito para atualizar os parâmetros da URL sempre que um filtro for alterado
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedStore) params.set('store', selectedStore);
    
    // Usa `replace: true` para não adicionar cada mudança de filtro ao histórico do navegador
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedStatus, selectedStore, setSearchParams]);

  const handleNewOrder = () => {
    navigate("/orders/new");
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // 1. Filtrar por Loja
    if (selectedStore !== 'ALL') {
      filtered = filtered.filter(order => order.store === selectedStore);
    }

    // 2. Filtrar por Status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // 3. Filtrar por Termo de Busca
    if (searchTerm.trim()) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.display_id.toLowerCase().includes(lowerCaseSearch) ||
        order.client.toLowerCase().includes(lowerCaseSearch) ||
        order.equipment.toLowerCase().includes(lowerCaseSearch) ||
        (order.model && order.model.toLowerCase().includes(lowerCaseSearch))
      );
    }
    
    return filtered;
  }, [orders, selectedStore, selectedStatus, searchTerm]);

  const renderOrderGrid = (ordersToRender: ServiceOrder[]) => {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
        );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ordersToRender.map((order) => (
          <ServiceOrderCard key={order.id} order={order} />
        ))}
        {ordersToRender.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhuma ordem de serviço encontrada para os filtros aplicados.
          </div>
        )}
      </div>
    );
  };

  const statusCounts = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<ServiceOrderStatus, number>);
  }, [orders]);

  // As contagens agora refletem a lista completa antes do filtro de loja
  const allOrdersCount = orders.length;
  const caldasOrdersCount = orders.filter(o => o.store === 'CALDAS DA RAINHA').length;
  const portoOrdersCount = orders.filter(o => o.store === 'PORTO DE MÓS').length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-row justify-between items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
          <div className="flex gap-2">
            <Button onClick={handleNewOrder}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova OS
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por ID, cliente, equipamento ou modelo..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="flex-1 md:flex-none md:w-56">
              <Select 
                onValueChange={(value: StoreFilter) => setSelectedStore(value)} 
                value={selectedStore}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Loja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas as Lojas ({allOrdersCount})</SelectItem>
                  <SelectItem value="CALDAS DA RAINHA">Caldas da Rainha ({caldasOrdersCount})</SelectItem>
                  <SelectItem value="PORTO DE MÓS">Porto de Mós ({portoOrdersCount})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 md:flex-none md:w-56">
              <Select 
                onValueChange={(value: StatusFilter) => setSelectedStatus(value)} 
                value={selectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos ({orders.length})</SelectItem>
                  {serviceOrderStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status} ({statusCounts[status] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {renderOrderGrid(filteredOrders)}
        </div>
      </div>
    </Layout>
  );
};

export default ServiceOrders;