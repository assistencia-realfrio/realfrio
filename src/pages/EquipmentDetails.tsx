import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useEquipments } from "@/hooks/useEquipments";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EquipmentForm from "@/components/EquipmentForm";
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
import ActivityLog from "@/components/ActivityLog";

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { singleEquipment: equipment, isLoading, deleteEquipment } = useEquipments(undefined, id);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleGoBack = () => navigate(-1);

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    if (!equipment) return;
    try {
      await deleteEquipment.mutateAsync(equipment.id);
      showSuccess(`Equipamento '${equipment.name}' excluído com sucesso.`);
      navigate(-1);
    } catch (error) {
      console.error("Erro ao excluir equipamento:", error);
      showError("Erro ao excluir equipamento. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!equipment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Equipamento não encontrado</h2>
          <p className="text-muted-foreground">O equipamento que você está procurando não existe.</p>
          <Button onClick={handleGoBack} className="mt-4">Voltar</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
            <Button variant="outline" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{equipment.name}</h2>
          </div>
          
          <div className="flex flex-shrink-0 space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)} size="icon" className="sm:hidden" aria-label="Editar">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="hidden sm:flex">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <>
                  <Button variant="destructive" disabled={deleteEquipment.isPending} size="icon" className="sm:hidden" aria-label="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" disabled={deleteEquipment.isPending} className="hidden sm:flex">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O equipamento será excluído permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Equipamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nome</p>
              <p className="font-medium">{equipment.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Marca</p>
              <p className="font-medium">{equipment.brand || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Modelo</p>
              <p className="font-medium">{equipment.model || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Número de Série</p>
              <p className="font-medium">{equipment.serial_number || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <ActivityLog entityType="equipment" entityId={equipment.id} />
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Equipamento</DialogTitle>
          </DialogHeader>
          <EquipmentForm
            clientId={equipment.client_id}
            initialData={equipment}
            onSubmit={handleEditSuccess}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default EquipmentDetails;