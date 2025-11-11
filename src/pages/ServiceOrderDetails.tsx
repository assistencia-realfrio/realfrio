import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import ServiceOrderForm from "@/components/ServiceOrderForm";
import Attachments from "@/components/Attachments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Calendar as CalendarIcon, User } from "lucide-react"; // Importado CalendarIcon e User
import { Button } from "@/components/ui/button";
import { useServiceOrders } from "@/hooks/useServiceOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ServiceOrderBottomNav from "@/components/ServiceOrderBottomNav";
import ActivityLog from "@/components/ActivityLog";
import ServiceOrderEquipmentDetails from "@/components/ServiceOrderEquipmentDetails";
import ServiceOrderNotes from "@/components/ServiceOrderNotes";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const ServiceOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'new';
  
  const { order, isLoading, deleteOrder } = useServiceOrders(isNew ? undefined : id);
  
  const [newOrderId, setNewOrderId] = useState<string | undefined>(undefined);
  const [selectedView, setSelectedView] = useState<"details" | "attachments" | "equipment" | "activity" | "notes">("details");

  const currentOrderId = newOrderId || id;

  const initialData = order ? {
    id: order.id,
    equipment_id: order.equipment_id || undefined, 
    client_id: order.client_id,
    description: order.description,
    status: order.status,
    store: order.store,
    scheduled_date: order.scheduled_date, // NOVO
    technician_id: order.technician_id || undefined, // NOVO
  } : undefined;

  const handleGoBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleSubmit = (data: { id?: string }) => {
    if (isNew && data.id) {
        setNewOrderId(data.id);
        navigate(`/orders/${data.id}`, { replace: true });
    } else {
        // Se for edição, apenas volta
        handleGoBack(); 
    }
  };
  
  const handleDelete = async () => {
    if (!currentOrderId) return;

    try {
        await deleteOrder.mutateAsync(currentOrderId);
        showSuccess(`Ordem de Serviço ${order?.display_id || currentOrderId} excluída com sucesso.`);
        navigate('/', { replace: true });
    } catch (error) {
        console.error("Erro ao deletar OS:", error);
        showError("Erro ao excluir Ordem de Serviço. Tente novamente.");
    }
  };

  const displayTitleId = order?.display_id || currentOrderId;
  const titlePrefix = isNew ? "Criar Nova Ordem de Serviço" : "OS:";

  if (!isNew && isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!isNew && !order && !newOrderId) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">OS não encontrada</h2>
          <p className="text-muted-foreground">A Ordem de Serviço com ID {id} não existe ou você não tem permissão para vê-la.</p>
          <Button onClick={handleGoBack} className="mt-4">Voltar</Button>
        </div>
      </Layout>
    );
  }

  const canAccessTabs = !isNew || !!newOrderId;
  
  const scheduledDate = order?.scheduled_date ? parseISO(order.scheduled_date) : null;

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
                <Button variant="outline" size="icon" onClick={handleGoBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight truncate">
                  {isNew ? titlePrefix : (
                    <>
                      {titlePrefix} {displayTitleId}
                    </>
                  )}
                </h2>
            </div>
            <div className="flex flex-shrink-0 space-x-2">
                {!isNew && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={deleteOrder.isPending} aria-label="Excluir OS">
                                <Trash2 className="h-5 w-5 text-destructive" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente a Ordem de Serviço 
                                    <span className="font-semibold"> {displayTitleId}</span> e todos os dados associados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleDelete} 
                                    className="bg-destructive hover:bg-destructive/90"
                                    disabled={deleteOrder.isPending}
                                >
                                    Excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
          
        {selectedView === "details" && (
          <Card>
            <CardHeader>
              <CardTitle>{isNew ? "Preencha os detalhes da nova OS" : "Detalhes da Ordem de Serviço"}</CardTitle>
            </CardHeader>
            <CardContent>
              {!isNew && order && (
                <div className="mb-6 p-4 border rounded-md space-y-2 bg-muted/50">
                    <h3 className="text-md font-semibold mb-2">Agendamento</h3>
                    <div className="flex items-center text-sm">
                        <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-muted-foreground">Data Prevista: </span>
                        <span className="ml-2 font-medium">
                            {scheduledDate ? format(scheduledDate, 'PPP', { locale: ptBR }) : 'Não Agendado'}
                        </span>
                    </div>
                    <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-muted-foreground">Técnico: </span>
                        {order.technician_name ? (
                            <span className="ml-2 font-medium">
                                {order.technician_name}
                            </span>
                        ) : (
                            <span className="ml-2 text-muted-foreground italic">Não Atribuído</span>
                        )}
                    </div>
                </div>
              )}
              <ServiceOrderForm 
                initialData={initialData} 
                onSubmit={handleSubmit} 
                onCancel={isNew ? handleGoBack : undefined}
              />
            </CardContent>
          </Card>
        )}

        {selectedView === "attachments" && (
          !canAccessTabs ? (
            <p className="text-center text-muted-foreground py-8">Salve a OS para adicionar anexos.</p>
          ) : (
            <Attachments orderId={currentOrderId!} />
          )
        )}

        {selectedView === "equipment" && (
          !canAccessTabs || !order?.equipment_id ? (
            <p className="text-center text-muted-foreground py-8">Salve a OS e selecione um equipamento para ver seus detalhes.</p>
          ) : (
            <ServiceOrderEquipmentDetails equipmentId={order.equipment_id!} />
          )
        )}

        {selectedView === "activity" && (
          !canAccessTabs ? (
            <p className="text-center text-muted-foreground py-8">Salve a OS para ver o histórico de atividades.</p>
          ) : (
            <ActivityLog entityType="service_order" entityId={currentOrderId!} />
          )
        )}

        {selectedView === "notes" && (
          !canAccessTabs ? (
            <p className="text-center text-muted-foreground py-8">Salve a OS para adicionar e ver as notas.</p>
          ) : (
            <ServiceOrderNotes orderId={currentOrderId!} />
          )
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