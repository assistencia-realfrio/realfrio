import React, { useState, useMemo } from "react";
import { useServiceOrders, serviceOrderStatuses } from "@/hooks/useServiceOrders";
import ServiceOrderCard from "@/components/ServiceOrderCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const ServiceOrders: React.FC = () => {
  const { orders: data, isLoading } = useServiceOrders();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todas');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredOrders = useMemo(() => {
    let orders = data || [];

    // Filter by status
    if (statusFilter && statusFilter !== 'Todas') {
      orders = orders.filter(order => order.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      orders = orders.filter(order =>
        order.client?.toLowerCase().includes(lowercasedQuery) ||
        order.equipment?.toLowerCase().includes(lowercasedQuery) ||
        order.description?.toLowerCase().includes(lowercasedQuery) ||
        order.display_id?.toLowerCase().includes(lowercasedQuery)
      );
    }

    return orders;
  }, [data, searchQuery, statusFilter]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
        <Button onClick={() => navigate('/orders/new')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova OS
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquisar por cliente, equipamento, descrição..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              {serviceOrderStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => (
            <ServiceOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceOrders;