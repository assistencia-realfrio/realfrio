import React, { useState } from "react";
import Layout from "@/components/Layout";
import { PlusCircle, Calendar as CalendarIcon, Edit, Trash2 } from "lucide-react"; // Removido CheckCircle, XCircle, Clock
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
import { Skeleton } from "@/components/ui/skeleton";
import { useVacations, Vacation, VacationFormValues } from "@/hooks/useVacations"; // Removido VacationStatus
import VacationForm from "@/components/VacationForm";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSession } from "@/contexts/SessionContext";
// import { cn } from "@/lib/utils"; // Não é mais necessário se não houver badges de status

// Funções getStatusBadgeVariant e getStatusIcon removidas

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
            Agenda de Férias
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
                <TableHead className="text-right">Ações</TableHead> {/* Adicionado de volta para edição/exclusão */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
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
                    <TableCell className="text-right">
                      {user?.id === vacation.user_id && ( // Ações visíveis apenas para o próprio usuário
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenForm(vacation)} disabled={updateVacation.isPending}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive" disabled={deleteVacation.isPending}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente este pedido de férias.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(vacation.id)} 
                                  className="bg-destructive hover:bg-destructive/90"
                                  disabled={deleteVacation.isPending}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground"> {/* Colspan ajustado para 3 */}
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