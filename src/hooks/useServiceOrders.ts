import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceOrderFormValues } from "@/components/ServiceOrderForm"; // Assuming this type exists

export type ServiceOrder = {
  id: string;
  created_by: string | null;
  client_id: string | null;
  description: string | null;
  status: "POR INICIAR" | "INICIADA" | "PARA ORÇAMENTO" | "ORÇAMENTO ENVIADO" | "AGUARDA PEÇAS" | "PEÇAS RECEBIDAS" | "CONCLUIDA" | "CANCELADA";
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS" | null;
  created_at: string | null;
  updated_at: string | null;
  equipment: string; // This seems to be a string, not an ID
  model: string | null;
  serial_number: string | null;
  display_id: string | null;
  equipment_id: string | null;
  scheduled_date: string | null;
  technician_id: string | null;
};

export const useServiceOrders = () => {
  const queryClient = useQueryClient();

  // Fetch all service orders
  const allServiceOrdersQuery = useQuery<ServiceOrder[], Error>({
    queryKey: ["service_orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_orders").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch a single service order
  const useServiceOrder = (id: string, enabled: boolean) => {
    return useQuery<ServiceOrder, Error>({
      queryKey: ["service_orders", id],
      queryFn: async () => {
        const { data, error } = await supabase.from("service_orders").select("*").eq("id", id).single();
        if (error) throw error;
        return data;
      },
      enabled: enabled && !!id,
    });
  };

  // Create a service order
  const createServiceOrder = useMutation<ServiceOrder, Error, ServiceOrderFormValues>({
    mutationFn: async (newOrder) => {
      const { data, error } = await supabase.from("service_orders").insert(newOrder).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_orders"] });
    },
  });

  // Update a service order
  const updateServiceOrder = useMutation<ServiceOrder, Error, Partial<ServiceOrderFormValues> & { id: string }>({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from("service_orders").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["service_orders", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["service_orders"] });
    },
  });

  return {
    allServiceOrders: allServiceOrdersQuery.data,
    isLoadingAllServiceOrders: allServiceOrdersQuery.isLoading,
    errorAllServiceOrders: allServiceOrdersQuery.error,
    useServiceOrder,
    createServiceOrder,
    updateServiceOrder,
  };
};