import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import ServiceOrderForm from "@/components/ServiceOrderForm";
import Attachments from "@/components/Attachments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react"; // FileText removido
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
import ServiceOrderNotes from "@/components/ServiceOrderNotes"; // Importar o novo componente de notas

const ServiceOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'new';
  
  const { order, isLoading, deleteOrder } = useServiceOrders(isNew ? undefined : id);
  
  const [newOrderId, setNewOrderId] = useState<string | undefined>(undefined);
  const [selectedView, setSelectedView] = useState<"details" | "attachments" | "equipment" | "activity" | "notes">("details"); // 'notes' adicionado ao tipo

  const currentOrderId = newOrderId || id;

  const initialData = order ? {
    id: order.id,
    equipment_id: order.equipment_id || undefined, 
    client_id: order.client_id,
    description: order.description,
    status: order.status,
    store: order.store,
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
        handleGoBack(); 
    }
  };
  
  const handleDelete = async () => {
    if (!currentOrderId) return;

    try {
        await deleteOrder.mutateAsync(currentOrderId);
        showSuccess(`ORDEM DE SERVIÇO ${order?.display_id || currentOrderId} EXCLUÍDA COM SUCESSO.`);
        navigate('/', { replace: true });
    } catch (error) {
        console.error("Erro ao deletar OS:", error);
        showError("ERRO AO EXCLUIR ORDEM DE SERVIÇO. TENTE NOVAMENTE.");
    }
  };

  const displayTitleId = (order?.display_id || currentOrderId || '').toUpperCase();
  const titlePrefix = isNew ? "CRIAR NOVA ORDEM DE SERVIÇO" : "OS:";

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
          <h2 className="text-2xl font-bold">OS NÃO ENCONTRADA</h2>
          <p className="text-muted-foreground">A ORDEM DE SERVIÇO COM ID {id} NÃO EXISTE OU VOCÊ NÃO TEM PERMISSÃO PARA VÊ-LA.</p>
          <Button onClick={handleGoBack} className="mt-4">VOLTAR</Button>
        </div>
      </Layout>
    );
  }

  const canAccessTabs = !isNew || !!newOrderId;

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
                {/* Botão de Relatório Removido */}
                {!isNew && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={deleteOrder.isPending} aria-label="Excluir OS">
                                <Trash2 className="h-5 w-5 text-destructive" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>TEM CERTEZA ABSOLUTA?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    ESTA AÇÃO NÃO PODE SER DESFEITA. ISSO EXCLUIRÁ PERMANENTEMENTE A ORDEM DE SERVIÇO 
                                    <span className="font-semibold"> {displayTitleId}</span> E TODOS OS DADOS ASSOCIADOS.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>CANCELAR</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleDelete} 
                                    className="bg-destructive hover:bg-destructive/90"
                                    disabled={deleteOrder.isPending}
                                >
                                    EXCLUIR
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
          
        {selectedView === "details" && (
          <Card className="shadow-none border-none">
            <CardHeader>
              <CardTitle>{isNew ? "PREENCHA OS DETALHES DA NOVA OS" : "EDITAR ORDEM DE SERVIÇO"}</CardTitle> {/* Removido o texto "EDITAR ORDEM DE SERVIÇO" */}
            </CardHeader>
            <CardContent>
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
            <p className="text-center text-muted-foreground py-8">SALVE A OS PARA ADICIONAR ANEXOS.</p>
          ) : (
            <Attachments orderId={currentOrderId!} />
          )
        )}

        {selectedView === "equipment" && (
          !canAccessTabs || !order?.equipment_id ? (
            <p className="text-center text-muted-foreground py-8">SALVE A OS E SELECIONE UM EQUIPAMENTO PARA VER SEUS DETALHOS.</p>
          ) : (
            <ServiceOrderEquipmentDetails equipmentId={order.equipment_id!} />
          )
        )}

        {selectedView === "activity" && (
          !canAccessTabs ? (
            <p className="text-center text-muted-foreground py-8">SALVE A OS PARA VER O HISTÓRICO DE ATIVIDADES.</p>
          ) : (
            <ActivityLog entityType="service_order" entityId={currentOrderId!} />
          )
        )}

        {selectedView === "notes" && ( // Nova aba para Notas
          !canAccessTabs ? (
            <p className="text-center text-muted-foreground py-8">SALVE A OS PARA ADICIONAR E VER AS NOTAS.</p>
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