import React, { useState } from "react";
import Layout from "@/components/Layout";
import { PlusCircle, Calendar as CalendarIcon, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useVacations, Vacation, VacationFormValues, VacationStatus } from "@/hooks/useVacations";
import VacationForm from "@/components/VacationForm";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSession } from "@/contexts/SessionContext";
import { cn } from "@/lib/utils";

const getStatusBadgeVariant = (status: VacationStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "approved":
      return "default";
    case "pending":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusIcon = (status: VacationStatus) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

const Vacations: React.FC = () => {
  const { user } = useSession();
  const { vacations, isLoading, createVacation, updateVacation, deleteVacation } = useVacations();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVacation, setEditingVacation] = useState<Vacation | undefined>(undefined);

  const handleOpenForm = (vacation?: Vacation) => {
    setEditingVacation(vacation);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setEditingVacation(undefined);
    setIsFormModalOpen(false);
  };

  const handleSubmit = async (data: VacationFormValues) => {
    try {
      const payload = {
        start_date: data.start_date.toISOString().split('T')[0], // Formato 'YYYY-MM-DD'
        end_date: data.end_date.toISOString().split('T')[0],     // Formato 'YYYY-MM-DD'
        notes: data.notes,
      };

      if (editingVacation) {
        await updateVacation.mutateAsync({ id: editingVacation.id, ...payload });
        showSuccess("Pedido de férias atualizado com sucesso!");
      } else {
        await createVacation.mutateAsync(payload);
        showSuccess("Pedido de férias enviado com sucesso!");
      }
      handleCloseForm();
    } catch (error) {
      console.error("Erro ao salvar férias:", error);
      showError("Erro ao salvar pedido de férias. Tente novamente.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVacation.mutateAsync(id);
      showSuccess("Pedido de férias excluído com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir férias:", error);
      showError("Erro ao excluir pedido de férias. Tente novamente.");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-7 w-7" />
            Gestão de Férias
          </h2>
          <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenForm()} className="h-10 px-4 py-2">
                <PlusCircle className="h-5 w-5 mr-2" />
                Solicitar Férias
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingVacation ? "Editar Pedido de Férias" : "Novo Pedido de Férias"}</DialogTitle>
              </DialogHeader>
              <VacationForm
                initialData={editingVacation}
                onSubmit={handleSubmit}
                onCancel={handleCloseForm}
                isPending={createVacation.isPending || updateVacation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border overflow-x-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Período</TableHead>
                {/* Removido TableHead para Notas */}
                {/* Removido TableHead para Estado */}
                {/* Removido TableHead para Ações */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                    {/* Removido Skeleton para Notas */}
                    {/* Removido Skeleton para Estado */}
                    {/* Removido Skeleton para Ações */}
                  </TableRow>
                ))
              ) : vacations.length > 0 ? (
                vacations.map((vacation) => (
                  <TableRow key={vacation.id}>
                    <TableCell className="font-medium">{vacation.user_full_name}</TableCell>
                    <TableCell>
                      {format(new Date(vacation.start_date), 'dd/MM/yyyy', { locale: ptBR })} -{" "}
                      {format(new Date(vacation.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    {/* Removido TableCell para Notas */}
                    {/* Removido TableCell para Estado */}
                    {/* Removido TableCell para Ações */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center text-muted-foreground"> {/* Colspan ajustado para 2 */}
                    Nenhum pedido de férias encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default Vacations;