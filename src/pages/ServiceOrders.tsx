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
import { useProfile } from "@/hooks/useProfile";

type StoreFilter = ServiceOrder['store'] | 'ALL';
type StatusFilter = ServiceOrderStatus | 'ALL';

const ServiceOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, isLoading: isLoadingProfile } = useProfile();

  // O estado agora é inicializado lendo a URL, ou 'ALL' como fallback temporário.
  const [selectedStore, setSelectedStore] = useState<StoreFilter>(
    () => (searchParams.get('store') as StoreFilter) || 'ALL'
  );
  
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>(
    () => (searchParams.get('status') as StatusFilter) || 'ALL'
  );

  // Efeito para definir o filtro de loja padrão com base no perfil do utilizador
  useEffect(() => {
    // Executa apenas depois que o perfil for carregado e se não houver filtro de loja na URL
    if (!isLoadingProfile && !searchParams.has('store')) {
      if (profile?.store) {
        setSelectedStore(profile.store);
      } else {
        setSelectedStore('ALL');
      }
    }
  }, [profile, isLoadingProfile, searchParams]);
  
  // Hook principal de dados
  const { orders, isLoading } = useServiceOrders(undefined, selectedStore, selectedStatus);

  const allOrders = orders;

  const availableStatuses = useMemo(() => {
    return serviceOrderStatuses;
  }, []);

  // Efeito para sincronizar o estado dos filtros com a URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (selectedStore && selectedStore !== 'ALL') {
      params.set('store', selectedStore);
    } else {
      params.delete('store');
    }

    if (selectedStatus && selectedStatus !== 'ALL') {
      params.set('status', selectedStatus);
    } else {
      params.delete('status');
    }
    
    setSearchParams(params, { replace: true });
  }, [selectedStatus, selectedStore, setSearchParams]);

  const handleNewOrder = () => {
    navigate("/orders/new");
  };

  const { orders: allOrdersWithoutStatusFilter } = useServiceOrders(undefined, selectedStore, 'ALL');

  const renderOrderGrid = (ordersToRender: ServiceOrder[]) => {
    if (isLoading || isLoadingProfile) {
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">ASSISTÊNCIAS</h2>
          <Button className="flex-shrink-0" onClick={handleNewOrder}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova OS
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex w-full items-center gap-2">
            <div className="flex-1">
              <Select 
                onValueChange={(value: StoreFilter) => setSelectedStore(value)} 
                value={selectedStore}
                disabled={isLoadingProfile}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="LOJA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">TODAS AS LOJAS ({allOrdersWithoutStatusFilter.length})</SelectItem>
                  <SelectItem value="CALDAS DA RAINHA">CALDAS DA RAINHA ({allOrdersWithoutStatusFilter.filter(o => o.store === 'CALDAS DA RAINHA').length})</SelectItem>
                  <SelectItem value="PORTO DE MÓS">PORTO DE MÓS ({allOrdersWithoutStatusFilter.filter(o => o.store === 'PORTO DE MÓS').length})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select 
                onValueChange={(value: StatusFilter) => setSelectedStatus(value)} 
                value={selectedStatus}
                disabled={isLoadingProfile}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="ESTADOS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">TODOS ({allOrdersWithoutStatusFilter.filter(o => selectedStore === 'ALL' || o.store === selectedStore).length})</SelectItem>
                  {availableStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.toUpperCase()} ({allOrdersWithoutStatusFilter.filter(o => (selectedStore === 'ALL' || o.store === selectedStore) && o.status === status).length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {renderOrderGrid(allOrders)}
        </div>
      </div>
    </Layout>
  );
};

export default ServiceOrders;