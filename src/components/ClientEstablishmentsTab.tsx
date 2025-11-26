import React, { useState } from "react";
import { useClientEstablishments, Establishment } from "@/hooks/useClientEstablishments";
import { Skeleton } from "@/components/ui/skeleton";
import EstablishmentCard from "./EstablishmentCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EstablishmentForm from "./EstablishmentForm";
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

interface ClientEstablishmentsTabProps {
  clientId: string;
}

const ClientEstablishmentsTab: React.FC<ClientEstablishmentsTabProps> = ({ clientId }) => {
  const { establishments, isLoading, createEstablishment, updateEstablishment, deleteEstablishment } = useClientEstablishments(clientId);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEstablishment, setEditingEstablishment] = useState<Establishment | undefined>(undefined);

  const handleOpenForm = (establishment?: Establishment) => {
    setEditingEstablishment(establishment);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setEditingEstablishment(undefined);
    setIsFormModalOpen(false);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingEstablishment) {
        await updateEstablishment.mutateAsync({ ...data, id: editingEstablishment.id });
        showSuccess("Estabelecimento atualizado com sucesso!");
      } else {
        await createEstablishment.mutateAsync(data);
        showSuccess("Estabelecimento criado com sucesso!");
      }
      handleCloseForm();
    } catch (error) {
      showError("Erro ao salvar estabelecimento.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEstablishment.mutateAsync(id);
      showSuccess("Estabelecimento excluído com sucesso.");
    } catch (error) {
      showError("Erro ao excluir estabelecimento.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {establishments.length > 0 ? (
        establishments.map((est) => (
          <EstablishmentCard
            key={est.id}
            establishment={est}
            onEdit={() => handleOpenForm(est)}
            onDelete={(id) => handleDelete(id)}
            isPending={deleteEstablishment.isPending}
          />
        ))
      ) : (
        <p className="text-center text-muted-foreground py-8 text-sm uppercase">
          Nenhum estabelecimento associado a este cliente.
        </p>
      )}

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="uppercase">{editingEstablishment ? "Editar" : "Adicionar"} Estabelecimento</DialogTitle>
          </DialogHeader>
          <EstablishmentForm
            clientId={clientId}
            initialData={editingEstablishment}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isPending={createEstablishment.isPending || updateEstablishment.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientEstablishmentsTab;