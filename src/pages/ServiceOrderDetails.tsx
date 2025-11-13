"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useServiceOrder, useUpdateServiceOrder, useCreateServiceOrder } from "@/hooks/useServiceOrders";
import { useClients } from "@/hooks/useClients";
import { useEquipments } from "@/hooks/useEquipments";
import { useProfiles } from "@/hooks/useProfiles";
import ServiceOrderForm, { ServiceOrderFormValues } from "@/components/ServiceOrderForm";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ServiceOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const { data: serviceOrder, isLoading: isLoadingServiceOrder, error: serviceOrderError } = useServiceOrder(id || "", !isNew);
  const { data: clients, isLoading: isLoadingClients } = useClients();
  const { data: equipments, isLoading: isLoadingEquipments } = useEquipments();
  const { data: profiles, isLoading: isLoadingProfiles } = useProfiles();

  const updateServiceOrder = useUpdateServiceOrder();
  const createServiceOrder = useCreateServiceOrder();

  const [defaultValues, setDefaultValues] = useState<ServiceOrderFormValues | undefined>(undefined);

  useEffect(() => {
    if (!isNew && serviceOrder) {
      setDefaultValues({
        client_id: serviceOrder.client_id || "",
        description: serviceOrder.description || "",
        status: serviceOrder.status || "pending",
        store: serviceOrder.store || "",
        equipment_id: serviceOrder.equipment_id || "",
        scheduled_date: serviceOrder.scheduled_date ? new Date(serviceOrder.scheduled_date) : undefined,
        technician_id: serviceOrder.technician_id || "",
      });
    } else if (isNew) {
      setDefaultValues({
        client_id: "",
        description: "",
        status: "pending",
        store: "",
        equipment_id: "",
        scheduled_date: undefined,
        technician_id: "",
      });
    }
  }, [isNew, serviceOrder]);

  const handleSubmit = async (data: ServiceOrderFormValues) => {
    try {
      if (isNew) {
        const newOrder = await createServiceOrder.mutateAsync(data);
        showSuccess("Ordem de serviço criada com sucesso!");
        navigate(`/orders/${newOrder.id}`);
      } else if (id) {
        await updateServiceOrder.mutateAsync({ id, ...data });
        showSuccess("Ordem de serviço atualizada com sucesso!");
        navigate(`/orders/${id}`);
      }
    } catch (error) {
      console.error("Erro ao salvar ordem de serviço:", error);
      showError("Erro ao salvar ordem de serviço. Tente novamente.");
    }
  };

  if (!isNew && isLoadingServiceOrder) {
    return <Skeleton className="h-[calc(100vh-100px)] w-full" />;
  }

  if (!isNew && serviceOrderError) {
    return <div className="text-red-500">Erro ao carregar ordem de serviço: {serviceOrderError.message}</div>;
  }

  if (isLoadingClients || isLoadingEquipments || isLoadingProfiles || defaultValues === undefined) {
    return <Skeleton className="h-[calc(100vh-100px)] w-full" />;
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate("/orders")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Ordens de Serviço
      </Button>
      <Card>
        <CardContent>
          <ServiceOrderForm
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            clients={clients || []}
            equipments={equipments || []}
            technicians={profiles || []}
            isNew={isNew}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceOrderDetails;