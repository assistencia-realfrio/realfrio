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
  const { establishments, isLoading, updateEstablishment, deleteEstablishment, createEstablishment } = useClientEstablishments(clientId);
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
        // Se estiver criando, o botão de adicionar está em ClientDetails.tsx, mas o hook de criação
        // precisa ser chamado de lá. Aqui, só tratamos a edição e exclusão.
        // Se este componente for usado apenas para listar, podemos remover a lógica de criação/edição daqui.
        // No entanto, como o EstablishmentCard chama onEdit/onDelete, precisamos manter a lógica de edição/exclusão.
        // A criação é tratada no ClientDetails.tsx.
        // Se o formulário for submetido aqui sem initialData, é um erro, mas vamos manter a estrutura para edição.
        // Para simplificar, vamos assumir que o handleSubmit só é chamado para edição dentro deste componente.
        await updateEstablishment.mutateAsync({ ...data, id: editingEstablishment!.id });
        showSuccess("Estabelecimento atualizado com sucesso!");
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
        <p className="text-center text-muted-foreground py-8 text-sm">
          Nenhum estabelecimento associado a este cliente.
        </p>
      )}

      {/* Modal de Edição (Criação removida, pois é feita em ClientDetails.tsx) */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEstablishment ? "Editar" : "Adicionar"} Estabelecimento</DialogTitle>
          </DialogHeader>
          {editingEstablishment && (
            <EstablishmentForm
              clientId={clientId}
              initialData={editingEstablishment}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              isPending={updateEstablishment.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientEstablishmentsTab;