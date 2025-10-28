import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ServiceOrderStatus, serviceOrderStatuses } from "@/lib/serviceOrderStatus";

export type ServiceOrder = {
  id: string;
  display_id: string;
  created_by: string;
  client_id: string;
  client: string; // This will be fetched from the clients table
  equipment: string;
  model: string | null;
  serial_number: string | null;
  description: string | null;
  status: ServiceOrderStatus;
  store: 'CALDAS DA RAINHA' | 'PORTO DE MÓS';
  created_at: string;
  updated_at: string;
};

export const useServiceOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("service_orders")
          .select(`
            *,
            client:clients(name)
          `)
          .eq("created_by", user.id);

        if (error) throw error;

        const formattedData = data.map((order: any) => ({
          ...order,
          client: order.client?.name || "Cliente Desconhecido",
          display_id: `OS-${String(order.id.split('-')[0]).toUpperCase()}`
        }));
        
        setOrders(formattedData);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching service orders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => {
      // Sort by status first, using the predefined order
      const orderA = serviceOrderStatuses.indexOf(a.status);
      const orderB = serviceOrderStatuses.indexOf(b.status);
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // Then sort by creation date, newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [orders]);

  return { orders: sortedOrders, isLoading, error };
};