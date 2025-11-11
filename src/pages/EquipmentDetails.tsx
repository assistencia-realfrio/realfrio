import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useEquipments } from "@/hooks/useEquipments";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, FolderOpen } from "lucide-react"; // Adicionado FolderOpen
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
import EquipmentOrdersTab from "@/components/EquipmentOrdersTab";
import EquipmentDetailsBottomNav from "@/components/EquipmentDetailsBottomNav";
import EquipmentAttachments from "@/components/EquipmentAttachments"; // Importando o novo componente de anexos

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { singleEquipment: equipment, isLoading, deleteEquipment } = useEquipments(undefined, id);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<"details" | "orders" | "attachments">("details"); // 'history' removido do tipo e valor inicial

  const handleGoBack = () => navigate(-1);

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    if (!equipment) return;
    try {
      await deleteEquipment.mutateAsync(equipment.id);
      showSuccess(`EQUIPAMENTO '${equipment.name}' EXCLUÍDO COM SUCESSO.`);
      navigate(-1);
    } catch (error) {
      console.error("Erro ao excluir equipamento:", error);
      showError("ERRO AO EXCLUIR EQUIPAMENTO. TENTE NOVAMENTE.");
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
          <h2 className="text-2xl font-bold">EQUIPAMENTO NÃO ENCONTRADO</h2>
          <p className="text-muted-foreground">O EQUIPAMENTO QUE VOCÊ ESTÁ PROCURANDO NÃO EXISTE.</p>
          <Button onClick={handleGoBack} className="mt-4">VOLTAR</Button>
        </div>
      </Layout>
    );
  }

  const hasGoogleDriveLink = equipment.google_drive_link && equipment.google_drive_link.trim() !== '';

  return (
    <Layout>
      <div className="space-y-6 pb-20"> {/* Adicionado padding-bottom para a navegação inferior */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
            <Button variant="outline" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {/* Removido o h2 que exibia o nome do equipamento */}
          </div>
          
          <div className="flex flex-shrink-0 space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)} size="icon" className="sm:hidden" aria-label="Editar">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="hidden sm:flex">
              <Edit className="h-4 w-4 mr-2" />
              EDITAR
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <>
                  <Button variant="destructive" disabled={deleteEquipment.isPending} size="icon" className="sm:hidden" aria-label="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" disabled={deleteEquipment.isPending} className="hidden sm:flex">
                    <Trash2 className="h-4 w-4 mr-2" />
                    EXCLUIR
                  </Button>
                </>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>TEM CERTEZA?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ESTA AÇÃO NÃO PODE SER DESFEITA. O EQUIPAMENTO SERÁ EXCLUÍDO PERMANENTEMENTE.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>CANCELAR</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    EXCLUIR
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {selectedView === "details" && (
          <Card>
            <CardContent className="space-y-4 text-sm pt-6">
              <div>
                <p className="text-muted-foreground">NOME</p>
                <p className="font-medium">{equipment.name.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">MARCA</p>
                <p className="font-medium">{(equipment.brand || 'N/A').toUpperCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">MODELO</p>
                <p className="font-medium">{(equipment.model || 'N/A').toUpperCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">NÚMERO DE SÉRIE</p>
                <p className="font-medium">{(equipment.serial_number || 'N/A').toUpperCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">GOOGLE DRIVE</p>
                {hasGoogleDriveLink ? (
                  <a 
                    href={equipment.google_drive_link!} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <FolderOpen className="h-4 w-4" />
                    ABRIR PASTA
                  </a>
                ) : (
                  <p className="text-muted-foreground">N/A</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedView === "orders" && (
          <EquipmentOrdersTab equipmentId={equipment.id} />
        )}

        {selectedView === "attachments" && ( // Aba para anexos do equipamento
          <EquipmentAttachments equipmentId={equipment.id} />
        )}

        {/* Removido: {selectedView === "history" && ( // Aba de histórico de atividades do equipamento
          <ActivityLog entityType="equipment" entityId={equipment.id} />
        )} */}
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>EDITAR EQUIPAMENTO</DialogTitle>
          </DialogHeader>
          <EquipmentForm
            clientId={equipment.client_id}
            initialData={equipment}
            onSubmit={handleEditSuccess}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <EquipmentDetailsBottomNav
        selectedView={selectedView}
        onSelectView={setSelectedView}
      />
    </Layout>
  );
};

export default EquipmentDetails;