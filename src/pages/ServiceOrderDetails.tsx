import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import ServiceOrderForm from "@/components/ServiceOrderForm";
import Attachments from "@/components/Attachments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Edit, X } from "lucide-react";
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
import { useOrderNotesCount } from "@/hooks/useOrderNotesCount";
import { useOrderAttachmentsCount } from "@/hooks/useOrderAttachmentsCount";

const ServiceOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'new';
  
  const { order, isLoading, deleteOrder } = useServiceOrders(isNew ? undefined : id);
  
  const [newOrderId, setNewOrderId] = useState<string | undefined>(undefined);
  const [selectedView, setSelectedView] = useState<"details" | "attachments" | "activity" | "notes">("details");
  const [isEditing, setIsEditing] = useState(isNew);

  const currentOrderId = newOrderId || id;

  const { data: notesCount = 0 } = useOrderNotesCount(currentOrderId || '');
  const { data: attachmentsCount = 0 } = useOrderAttachmentsCount(currentOrderId || '');

  const initialData = order ? {
    id: order.id,
    equipment_id: order.equipment_id || undefined, 
    client_id: order.client_id,
    description: order.description,
    status: order.status,
    store: order.store,
    scheduled_date: order.scheduled_date ? new Date(order.scheduled_date) : null,
    establishment_id: order.establishment_id,
    establishment_name: order.establishment_name,
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
        setIsEditing(false);
    } else {
        setIsEditing(false);
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
  const titlePrefix = isNew ? "Criar Nova Ordem de Serviço" : "Detalhes da OS";

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
          <h2 className="text-2xl font-bold uppercase">OS não encontrada</h2>
          <p className="text-muted-foreground uppercase">A Ordem de Serviço com ID {id} não existe ou você não tem permissão para vê-la.</p>
          <Button onClick={handleGoBack} className="mt-4 uppercase">Voltar</Button>
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
                <h2 className="text-lg sm:text-xl font-bold tracking-tight truncate uppercase">
                  {titlePrefix}
                </h2>
            </div>
            <div className="flex flex-shrink-0 space-x-2">
                
                {!isNew && selectedView === 'details' && (
                    <>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsEditing(prev => !prev)} 
                            size="icon" 
                            className="sm:hidden" 
                            aria-label={isEditing ? "Cancelar Edição" : "Editar"}
                        >
                            {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            onClick={() => setIsEditing(prev => !prev)} 
                            className="hidden sm:flex uppercase"
                        >
                            {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                            {isEditing ? "Cancelar" : "Editar"}
                        </Button>
                    </>
                )}
                
                {!isNew && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="destructive" 
                                disabled={deleteOrder.isPending} 
                                aria-label="Excluir OS"
                                className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-10 sm:px-4 uppercase"
                            >
                                <Trash2 className="h-4 w-4 mr-0 sm:mr-2" />
                                <span className="hidden sm:inline">Excluir</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="uppercase">Tem certeza absoluta?</AlertDialogTitle>
                                <AlertDialogDescription className="uppercase">
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente a Ordem de Serviço 
                                    <span className="font-semibold"> {displayTitleId}</span> e todos os dados associados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="uppercase">Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleDelete} 
                                    className="bg-destructive hover:bg-destructive/90 uppercase"
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
          <div className="space-y-6">
            {!isNew && (
              <Card className="shadow-sm">
                <div className="text-center p-4">
                  <p className="text-sm text-muted-foreground font-medium uppercase">Ordem de Serviço</p>
                  <h3 className="text-xl font-extrabold tracking-tight text-primary mt-1 uppercase">
                    {displayTitleId}
                  </h3>
                </div>
              </Card>
            )}
            <ServiceOrderForm 
              initialData={initialData} 
              onSubmit={handleSubmit} 
              onCancel={isNew ? handleGoBack : undefined}
              isEditing={isEditing}
            />
          </div>
        )}

        {selectedView === "notes" && (
          !canAccessTabs ? (
            <p className="text-center text-muted-foreground py-8 uppercase">Salve a OS para adicionar notas.</p>
          ) : (
            <div className="mt-6">
              <ServiceOrderNotes orderId={currentOrderId!} />
            </div>
          )
        )}

        {selectedView === "attachments" && (
          !canAccessTabs ? (
            <p className="text-center text-muted-foreground py-8 uppercase">Salve a OS para adicionar anexos.</p>
          ) : (
            <Attachments orderId={currentOrderId!} />
          )
        )}

        {selectedView === "activity" && (
          !canAccessTabs ? (
            <p className="text-center text-muted-foreground py-8 uppercase">Salve a OS para ver o histórico de atividades.</p>
          ) : (
            <ActivityLog entityType="service_order" entityId={currentOrderId!} />
          )
        )}
      </div>
      <ServiceOrderBottomNav
        selectedView={selectedView}
        onSelectView={setSelectedView}
        canAccessTabs={canAccessTabs}
        notesCount={notesCount}
        attachmentsCount={attachmentsCount}
      />
    </Layout>
  );
};

export default ServiceOrderDetails;