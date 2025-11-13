import React, { useState, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import FloatingActionButton from "@/components/FloatingActionButton"; // Importar o novo componente FAB

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
  
  const { orders, isLoading } = useServiceOrders();

  const allOrders = orders;

  const availableStatuses = useMemo(() => {
    return serviceOrderStatuses;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedStatus && selectedStatus !== 'ALL') params.set('status', selectedStatus);
    if (selectedStore && selectedStore !== 'ALL') params.set('store', selectedStore);
    setSearchParams(params, { replace: true });
  }, [selectedStatus, selectedStore, setSearchParams]);

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
    if (selectedStatus === 'ALL') {
      return ordersFilteredByStore;
    }
    return ordersFilteredByStore.filter(order => order.status === selectedStatus);
  }, [ordersFilteredByStore, selectedStatus]);

  const renderOrderGrid = (ordersToRender: ServiceOrder[]) => {
    if (isLoading) {
        return (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
        );
    }

    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          {/* O botão "NOVA OS" foi removido daqui e substituído pelo FAB */}
        </div>

        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex w-full items-center gap-2">
            <div className="flex-1">
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

            <div className="flex-1">
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
      
      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={handleNewOrder} 
        label="Nova Ordem de Serviço" 
        icon={PlusCircle} 
      />
    </Layout>
  );
};

export default ServiceOrders;