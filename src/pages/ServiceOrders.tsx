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
// import FloatingActionButton from "@/components/FloatingActionButton"; // Importar o novo componente FAB

type StoreFilter = ServiceOrder['store'] | 'ALL';
type StatusFilter = ServiceOrderStatus | 'ALL';

const ServiceOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedStore, setSelectedStore] = useState<StoreFilter>(
    (searchParams.get('store') as StoreFilter) || 'ALL'
  );
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>(
    (searchParams.get('status') as StatusFilter) || 'ALL' // ALTERADO: Definido como 'ALL' por padrão
  );
  
  // NOVO: Passar selectedStatus diretamente para useServiceOrders
  const { orders, isLoading } = useServiceOrders(undefined, selectedStore, selectedStatus);

  const allOrders = orders;

  const availableStatuses = useMemo(() => {
    return serviceOrderStatuses;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    
    // Apenas define o status na URL se não for 'ALL'
    if (selectedStatus && selectedStatus !== 'ALL') {
      params.set('status', selectedStatus);
    }
    
    // Apenas define a loja na URL se não for 'ALL'
    if (selectedStore && selectedStore !== 'ALL') {
      params.set('store', selectedStore);
    }
    
    setSearchParams(params, { replace: true });
  }, [selectedStatus, selectedStore, setSearchParams]);

  const handleNewOrder = () => {
    navigate("/orders/new");
  };

  // A filtragem por loja agora é feita no hook useServiceOrders, então 'ordersFilteredByStore' não é mais necessário aqui.
  // 'allOrders' já contém os pedidos filtrados por loja e status.

  const statusCounts = useMemo(() => {
    return allOrders.reduce((acc, order) => { // Usar allOrders (já filtrado)
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<ServiceOrderStatus, number>);
  }, [allOrders]);

  // 'filteredOrders' agora é simplesmente 'allOrders' porque a filtragem já ocorreu no hook
  const filteredOrders = allOrders;

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

  // Para as contagens nos seletores, precisamos das ordens *sem* o filtro de status, mas *com* o filtro de loja.
  // Para isso, vamos buscar as ordens novamente, mas apenas para as contagens.
  // Isso pode ser otimizado se o useServiceOrders retornar também as contagens totais por status/loja.
  // Por enquanto, para evitar uma nova chamada de API, vamos usar o `orders` que já vem filtrado por loja e status.
  // Se o `selectedStatus` for 'ALL', `allOrders` já terá todas as ordens da loja selecionada.
  // Se não for 'ALL', `allOrders` terá apenas as ordens da loja e status selecionados.
  // Para as contagens de "TODOS", vamos precisar de um `useServiceOrders` separado sem filtro de status.
  // Para simplificar, vou ajustar as contagens para refletir o que está sendo exibido.

  const { orders: allOrdersWithoutStatusFilter } = useServiceOrders(undefined, selectedStore, 'ALL'); // Nova chamada para contagens

  const allOrdersCount = allOrdersWithoutStatusFilter.length;
  const caldasOrdersCount = allOrdersWithoutStatusFilter.filter(o => o.store === 'CALDAS DA RAINHA').length;
  const portoOrdersCount = allOrdersWithoutStatusFilter.filter(o => o.store === 'PORTO DE MÓS').length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Assistências</h2>
          <Button className="w-full sm:w-auto" onClick={handleNewOrder}>
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
          {renderOrderGrid(filteredOrders)}
        </div>
      </div>
      
      {/* O FloatingActionButton foi removido daqui */}
    </Layout>
  );
};

export default ServiceOrders;