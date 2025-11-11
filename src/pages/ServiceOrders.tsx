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
import { isActiveStatus } from "@/lib/serviceOrderStatus";

type StoreFilter = ServiceOrder['store'] | 'ALL';
type StatusFilter = ServiceOrderStatus | 'ALL';

const ServiceOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedStore, setSelectedStore] = useState<StoreFilter>(
    (searchParams.get('store') as StoreFilter) || 'ALL'
  );
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>(
    (searchParams.get('status') as StatusFilter) || 'POR INICIAR'
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");
  
  const { orders, isLoading } = useServiceOrders();

  // Removido o filtro para mostrar apenas OS ativas na página principal
  // Agora, 'orders' já contém todas as ordens, e o filtro será aplicado abaixo.
  const allOrders = orders;

  // Filtra os status disponíveis para o dropdown, agora incluindo todos
  const availableStatuses = useMemo(() => {
    return serviceOrderStatuses; // Retorna todos os status
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedStore) params.set('store', selectedStore);
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedStatus, selectedStore, setSearchParams]);

  const handleNewOrder = () => {
    navigate("/orders/new");
  };

  const ordersFilteredByStore = useMemo(() => {
    if (selectedStore === 'ALL') {
      return allOrders;
    }
    return allOrders.filter(order => order.store === selectedStore);
  }, [allOrders, selectedStore]);

  const statusCounts = useMemo(() => {
    return ordersFilteredByStore.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<ServiceOrderStatus, number>);
  }, [ordersFilteredByStore]);

  const filteredOrders = useMemo(() => {
    let filtered = ordersFilteredByStore;

    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

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
  }, [ordersFilteredByStore, selectedStatus, searchTerm]);

  const renderOrderGrid = (ordersToRender: ServiceOrder[]) => {
    if (isLoading) {
        return (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> {/* Ajustado para grid-cols-1 em telas muito pequenas */}
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
        );
    }

    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> {/* Ajustado para grid-cols-1 em telas muito pequenas */}
        {ordersToRender.map((order) => (
          <ServiceOrderCard key={order.id} order={order} />
        ))}
        {ordersToRender.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            NENHUMA ASSISTÊNCIA ENCONTRADA PARA OS FILTROS APLICADOS.
          </div>
        )}
      </div>
    );
  };

  const allOrdersCount = allOrders.length;
  const caldasOrdersCount = allOrders.filter(o => o.store === 'CALDAS DA RAINHA').length;
  const portoOrdersCount = allOrders.filter(o => o.store === 'PORTO DE MÓS').length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-row justify-between items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Assistências</h2>
          <div className="flex gap-2">
            <Button onClick={handleNewOrder}>
              <PlusCircle className="mr-2 h-4 w-4" />
              NOVA OS
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="BUSCAR POR ID, CLIENTE, EQUIPAMENTO OU MODELO..." 
              className="pl-10" 
              value={searchTerm.toUpperCase()}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            />
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="flex-1 md:flex-none md:w-56">
              <Select 
                onValueChange={(value: StoreFilter) => setSelectedStore(value)} 
                value={selectedStore}
              >
                <SelectTrigger>
                  <SelectValue placeholder="LOJA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">TODAS AS LOJAS ({allOrdersCount})</SelectItem>
                  <SelectItem value="CALDAS DA RAINHA">CALDAS DA RAINHA ({caldasOrdersCount})</SelectItem>
                  <SelectItem value="PORTO DE MÓS">PORTO DE MÓS ({portoOrdersCount})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 md:flex-none md:w-56">
              <Select 
                onValueChange={(value: StatusFilter) => setSelectedStatus(value)} 
                value={selectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ESTADOS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">TODOS ({ordersFilteredByStore.length})</SelectItem>
                  {availableStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.toUpperCase()} ({statusCounts[status] || 0})
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