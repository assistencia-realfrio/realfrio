"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useServiceOrders, ServiceOrder } from "@/hooks/useServiceOrders"; // Import useServiceOrders and ServiceOrder
import ServiceOrderForm, { ServiceOrderFormData } from "@/components/ServiceOrderForm"; // Import ServiceOrderFormData
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout"; // Import Layout
import ServiceOrderBottomNav from "@/components/ServiceOrderBottomNav"; // Import ServiceOrderBottomNav
import Attachments from "@/components/Attachments"; // Import Attachments
import ActivityLog from "@/components/ActivityLog"; // Import ActivityLog
import ServiceOrderNotes from "@/components/ServiceOrderNotes"; // Import ServiceOrderNotes
import ServiceOrderEquipmentDetails from "@/components/ServiceOrderEquipmentDetails"; // Import ServiceOrderEquipmentDetails
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type View = 'details' | 'attachments' | 'equipment' | 'activity' | 'notes';

const ServiceOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const { singleOrder: serviceOrder, isLoading, error } = useServiceOrders(id || "");

  const [defaultValues, setDefaultValues] = useState<ServiceOrderFormData | undefined>(undefined);
  const [selectedView, setSelectedView] = useState<View>("details");

  useEffect(() => {
    if (!isNew && serviceOrder) {
      setDefaultValues({
        client_id: serviceOrder.client_id || "",
        description: serviceOrder.description || "",
        status: serviceOrder.status,
        store: serviceOrder.store || "CALDAS DA RAINHA", // Default to a valid store
        equipment_id: serviceOrder.equipment_id || "",
        scheduled_date: serviceOrder.scheduled_date ? new Date(serviceOrder.scheduled_date) : null,
        technician_id: serviceOrder.technician_id || "",
      });
    } else if (isNew) {
      setDefaultValues({
        client_id: "",
        description: "",
        status: "POR INICIAR", // Default to a valid status
        store: "CALDAS DA RAINHA", // Default to a valid store
        equipment_id: "",
        scheduled_date: null,
        technician_id: "",
      });
    }
  }, [isNew, serviceOrder]);

  const handleSubmit = (newOrderId?: string) => {
    if (isNew && newOrderId) {
      navigate(`/orders/${newOrderId}`);
    } else {
      // For updates, stay on the same page, form already handled success toast
    }
  };

  if (isLoading || defaultValues === undefined) {
    return (
      <Layout>
        <Skeleton className="h-[calc(100vh-100px)] w-full" />
      </Layout>
    );
  }

  if (!isNew && error) {
    return (
      <Layout>
        <div className="text-red-500">Erro ao carregar ordem de serviço: {error.message}</div>
      </Layout>
    );
  }

  const orderTitle = isNew 
    ? "Nova Ordem de Serviço" 
    : serviceOrder?.display_id 
      ? `OS ${serviceOrder.display_id}` 
      : "Detalhes da Ordem de Serviço";

  const canAccessTabs = !isNew && !!serviceOrder?.id;

  return (
    <Layout>
      <div className="space-y-6 pb-20"> {/* Adicionado padding-bottom para a navegação inferior */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{orderTitle}</h2>
        </div>

        {selectedView === "details" && (
          <Card>
            <CardContent className="p-4">
              <ServiceOrderForm
                onSubmit={handleSubmit}
                initialData={defaultValues}
                isNew={isNew}
                onCancel={() => navigate("/orders")}
              />
            </CardContent>
          </Card>
        )}

        {selectedView === "attachments" && canAccessTabs && serviceOrder?.id && (
          <Attachments orderId={serviceOrder.id} />
        )}

        {selectedView === "equipment" && canAccessTabs && serviceOrder?.equipment_id && (
          <ServiceOrderEquipmentDetails equipmentId={serviceOrder.equipment_id} />
        )}

        {selectedView === "activity" && canAccessTabs && serviceOrder?.id && (
          <ActivityLog entityType="service_order" entityId={serviceOrder.id} />
        )}

        {selectedView === "notes" && canAccessTabs && serviceOrder?.id && (
          <ServiceOrderNotes orderId={serviceOrder.id} />
        )}
      </div>
      <ServiceOrderBottomNav
        selectedView={selectedView}
        onSelectView={setSelectedView}
        canAccessTabs={canAccessTabs}
      />
    </Layout>
  );
};

export default ServiceOrderDetails;