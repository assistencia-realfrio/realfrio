import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useEquipments } from "@/hooks/useEquipments";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import EquipmentOrdersTab from "@/components/EquipmentOrdersTab";
import EquipmentDetailsBottomNav from "@/components/EquipmentDetailsBottomNav";
import EquipmentAttachments from "@/components/EquipmentAttachments";
import EquipmentDetailsView from "@/components/EquipmentDetailsView";
import EquipmentPlatePhoto from "@/components/EquipmentPlatePhoto";

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { singleEquipment: equipment, isLoading, deleteEquipment, updateEquipment } = useEquipments(undefined, id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedView, setSelectedView] = useState<"details" | "orders" | "attachments">("details");

  const handleGoBack = () => navigate(-1);

  const handleEditSuccess = () => {
    setIsEditing(false);
    showSuccess("Equipamento atualizado com sucesso!");
  };

  const handleFormSubmit = async (data: any) => {
    if (!equipment?.id) return;
    try {
        await updateEquipment.mutateAsync({
            id: equipment.id,
            client_id: equipment.client_id,
            name: data.name,
            brand: data.brand || undefined,
            model: data.model || undefined,
            serial_number: data.serial_number || undefined,
        });
        handleEditSuccess();
    } catch (error) {
        console.error("Erro ao atualizar equipamento:", error);
        showError("Erro ao atualizar equipamento. Tente novamente.");
    }
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
          <h2 className="text-2xl font-bold uppercase">Equipamento não encontrado</h2>
          <p className="text-muted-foreground uppercase">O equipamento que você está procurando não existe.</p>
          <Button onClick={handleGoBack} className="mt-4 uppercase">Voltar</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
            <Button variant="outline" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-shrink-0 space-x-2">
            {isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(false)} size="icon" className="sm:hidden" aria-label="Cancelar Edição">
                    <X className="h-4 w-4" />
                </Button>
            ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)} size="icon" className="sm:hidden" aria-label="Editar">
                    <Edit className="h-4 w-4" />
                </Button>
            )}
            
            {isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(false)} className="hidden sm:flex uppercase">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                </Button>
            ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="hidden sm:flex uppercase">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <>
                  <Button variant="destructive" disabled={deleteEquipment.isPending} size="icon" className="sm:hidden" aria-label="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" disabled={deleteEquipment.isPending} className="hidden sm:flex uppercase">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="uppercase">Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription className="uppercase">
                    Esta ação não pode ser desfeita. O equipamento será excluído permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="uppercase">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 uppercase">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {selectedView === "details" && (
          <div className="space-y-6">
            {isEditing ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="uppercase">Editar Detalhes do Equipamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EquipmentForm
                            clientId={equipment.client_id}
                            initialData={equipment}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setIsEditing(false)}
                        />
                    </CardContent>
                </Card>
            ) : (
                <EquipmentDetailsView equipment={equipment} />
            )}
            
            <EquipmentPlatePhoto equipmentId={equipment.id} />
          </div>
        )}

        {selectedView === "orders" && (
          <EquipmentOrdersTab equipmentId={equipment.id} />
        )}

        {selectedView === "attachments" && (
          <EquipmentAttachments equipmentId={equipment.id} />
        )}
      </div>

      <EquipmentDetailsBottomNav
        selectedView={selectedView}
        onSelectView={setSelectedView}
      />
    </Layout>
  );
};

export default EquipmentDetails;