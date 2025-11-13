import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceOrderFormData } from "@/components/ServiceOrderForm"; // Import ServiceOrderFormData
import { ServiceOrderStatus, serviceOrderStatuses } from "@/lib/serviceOrderStatus"; // Import from lib

// Re-export for convenience
export { ServiceOrderStatus, serviceOrderStatuses };

export type ServiceOrder = {
  id: string;
  created_by: string | null;
  client_id: string | null;
  client_name: string | null; // Added for join
  description: string | null;
  status: ServiceOrderStatus;
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS" | null;
  created_at: string | null;
  updated_at: string | null;
  equipment: string; // This seems to be a string, not an ID
  equipment_name: string | null; // Added for join
  model: string | null;
  serial_number: string | null;
  display_id: string | null;
  equipment_id: string | null;
  scheduled_date: string | null;
  technician_id: string | null;
  technician_name: string | null; // Added for join
};

// Define the mutation payload type based on ServiceOrderFormData, but with string for equipment
export type ServiceOrderMutationPayload = Omit<ServiceOrderFormData, 'scheduled_date' | 'equipment_id'> & {
  equipment: string; // Formatted equipment string
  model: string | null;
  serial_number: string | null;
  equipment_id: string | null; // Can be null if not selected
  scheduled_date: Date | null; // Date object for mutation
  technician_id: string | null; // Can be null if not selected
};


export const useServiceOrders = (orderId?: string, storeFilter: ServiceOrder['store'] | 'ALL' = 'ALL') => {
  const queryClient = useQueryClient();

  // Base query for fetching service orders
  const fetchServiceOrders = async (): Promise<ServiceOrder[]> => {
    let query = supabase
      .from("service_orders")
      .select(`
        *,
        clients (name),
        equipments (name),
        technicians:profiles (first_name, last_name)
      `);

    if (storeFilter !== 'ALL') {
      query = query.eq('store', storeFilter);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return data.map((order: any) => ({
      ...order,
      client_name: order.clients?.name || 'Cliente Desconhecido',
      equipment_name: order.equipments?.name || 'Equipamento Desconhecido',
      technician_name: order.technicians ? `${order.technicians.first_name || ''} ${order.technicians.last_name || ''}`.trim() : 'Técnico Desconhecido',
    })) as ServiceOrder[];
  };

  // Query for a single service order
  const fetchSingleServiceOrder = async (id: string): Promise<ServiceOrder> => {
    const { data, error } = await supabase
      .from("service_orders")
      .select(`
        *,
        clients (name),
        equipments (name),
        technicians:profiles (first_name, last_name)
      `)
      .eq("id", id)
      .single();
    if (error) throw error;
    
    return {
      ...data,
      client_name: data.clients?.name || 'Cliente Desconhecido',
      equipment_name: data.equipments?.name || 'Equipamento Desconhecido',
      technician_name: data.technicians ? `${data.technicians.first_name || ''} ${data.technicians.last_name || ''}`.trim() : 'Técnico Desconhecido',
    } as ServiceOrder;
  };

  // Use query for all orders (if no orderId) or a single order (if orderId is provided)
  const { data: orders, isLoading, error } = useQuery<ServiceOrder[], Error>({
    queryKey: ["service_orders", storeFilter],
    queryFn: fetchServiceOrders,
    enabled: !orderId, // Only fetch all orders if no specific orderId is provided
  });

  const { data: singleOrder, isLoading: isLoadingSingleOrder, error: errorSingleOrder } = useQuery<ServiceOrder, Error>({
    queryKey: ["service_orders", orderId],
    queryFn: () => fetchSingleServiceOrder(orderId!),
    enabled: !!orderId, // Only fetch single order if orderId is provided
  });

  // Create a service order
  const createOrder = useMutation<ServiceOrder, Error, ServiceOrderMutationPayload>({
    mutationFn: async (newOrder) => {
      const { data, error } = await supabase.from("service_orders").insert(newOrder).select().single();
      if (error) throw error;
      return data as ServiceOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_orders"] });
    },
  });

  // Update a service order
  const updateOrder = useMutation<ServiceOrder, Error, Partial<ServiceOrderMutationPayload> & { id: string }>({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from("service_orders").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as ServiceOrder;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["service_orders", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["service_orders"] });
    },
  });

  return {
    orders: orders || [],
    singleOrder,
    isLoading: isLoading || isLoadingSingleOrder,
    error: error || errorSingleOrder,
    createOrder,
    updateOrder,
  };
};