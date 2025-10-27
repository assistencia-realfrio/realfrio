import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ServiceOrderForm, { ServiceOrderFormValues } from "@/components/ServiceOrderForm";
import ActivityLog from "@/components/ActivityLog";
import TimeEntryComponent from "@/components/TimeEntry";
import Attachments from "@/components/Attachments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServiceOrders, ServiceOrder } from "@/hooks/useServiceOrders";
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

const ServiceOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const isNew = id === 'new';
  
  // Se for edição, buscamos a ordem específica
  const { order, isLoading, deleteOrder } = useServiceOrders(isNew ? undefined : id);
  
  // Estado para armazenar o ID da OS recém-criada, se aplicável
  const [newOrderId, setNewOrderId] = useState<string | undefined>(undefined);

  // O ID real a ser usado para logs/anexos
  const currentOrderId = newOrderId || id;

  const initialData = order ? {
    id: order.id,
    // equipment, model, serial_number são preenchidos pelo hook, mas o form agora precisa do equipment_id
    equipment_id: order.equipment_id || undefined, 
    client_id: order.client_id,
    description: order.description,
    status: order.status,
    store: order.store,
  } : undefined;

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSubmit = (data: ServiceOrderFormValues & { id?: string }) => {
    if (isNew && data.id) {
        // Se for uma nova OS e a mutação retornou um ID, navegamos para a página de detalhes
        setNewOrderId(data.id);
        navigate(`/orders/${data.id}`, { replace: true });
    } else {
        // Para edição, voltamos
        handleGoBack(); 
    }
  };
  
  const handleDelete = async () => {
    if (!currentOrderId) return;

    try {
        await deleteOrder.mutateAsync(currentOrderId);
        showSuccess(`Ordem de Serviço ${order?.display_id || currentOrderId} excluída com sucesso.`);
        navigate('/orders', { replace: true }); // Redireciona para a lista de OS
    } catch (error) {
        console.error("Erro ao deletar OS:", error);
        showError("Erro ao excluir Ordem de Serviço. Tente novamente.");
    }
  };

  // Usamos o display_id se estiver disponível, senão usamos o UUID (id)
  const displayTitleId = order?.display_id || currentOrderId;
  const title = isNew ? "Criar Nova Ordem de Serviço" : `Detalhes da OS: ${displayTitleId}`;

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

  // Se estivermos em uma OS existente ou recém-criada
  const canAccessTabs = !isNew || !!newOrderId;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleGoBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            </div>
            
            {/* Botão de Excluir (visível apenas se não for uma nova OS) */}
            {!isNew && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deleteOrder.isPending}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir OS
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

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4"> {/* Ajustado para 2 colunas em mobile, 4 em sm+ */}
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="activity" disabled={!canAccessTabs}>Atividades</TabsTrigger>
            <TabsTrigger value="time" disabled={!canAccessTabs}>Tempo</TabsTrigger>
            <TabsTrigger value="attachments" disabled={!canAccessTabs}>Anexos</TabsTrigger>
          </TabsList>
          
          {/* Aba de Detalhes/Edição */}
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{isNew ? "Preencha os detalhes da nova OS" : "Editar Ordem de Serviço"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ServiceOrderForm 
                  initialData={initialData} 
                  onSubmit={handleSubmit} 
                  onCancel={isNew ? handleGoBack : undefined} // Adiciona o botão de cancelar apenas na criação
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Abas de Acompanhamento (só acessíveis após a criação) */}
          <TabsContent value="activity" className="mt-6">
            {!canAccessTabs ? (
              <p className="text-center text-muted-foreground py-8">Salve a OS para registrar atividades.</p>
            ) : (
              <ActivityLog orderId={currentOrderId!} />
            )}
          </TabsContent>

          <TabsContent value="time" className="mt-6">
            {!canAccessTabs ? (
              <p className="text-center text-muted-foreground py-8">Salve a OS para registrar tempo.</p>
            ) : (
              <TimeEntryComponent orderId={currentOrderId!} />
            )}
          </TabsContent>

          <TabsContent value="attachments" className="mt-6">
            {!canAccessTabs ? (
              <p className="text-center text-muted-foreground py-8">Salve a OS para adicionar anexos.</p>
            ) : (
              <Attachments orderId={currentOrderId!} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ServiceOrderDetails;