import React, { useState } from "react";
import Layout from "@/components/Layout";
import { PlusCircle, Calendar as CalendarIcon, Edit, Trash2, List } from "lucide-react";
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
import { useVacations, Vacation, VacationFormValues } from "@/hooks/useVacations";
import VacationForm from "@/components/VacationForm";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSession } from "@/contexts/SessionContext";
import VacationCalendar from "@/components/VacationCalendar";
import { useAllProfiles } from "@/hooks/useAllProfiles";
import UpcomingVacationsAlert from "@/components/UpcomingVacationsAlert";

type ViewMode = 'list' | 'calendar';

const Vacations: React.FC = () => {
  const { user } = useSession();
  const { vacations, isLoading, createVacation, updateVacation, deleteVacation } = useVacations();
  const { data: allProfiles = [], isLoading: isLoadingProfiles } = useAllProfiles();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVacation, setEditingVacation] = useState<Vacation | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');

  const handleOpenForm = (vacation?: Vacation) => {
    setEditingVacation(vacation);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setEditingVacation(undefined);
    setIsFormModalOpen(false);
  };

  const handleSubmit = async (data: VacationFormValues & { userIdForRequest?: string }) => {
    try {
      const payload = {
        user_id: data.userIdForRequest,
        start_date: data.start_date.toISOString().split('T')[0],
        end_date: data.end_date.toISOString().split('T')[0],
        notes: data.notes,
      };

      if (editingVacation) {
        const updatePayload = {
          id: editingVacation.id,
          start_date: payload.start_date,
          end_date: payload.end_date,
          notes: payload.notes,
        };
        await updateVacation.mutateAsync(updatePayload);
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

  const isDataLoading = isLoading || isLoadingProfiles;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 uppercase">
            <CalendarIcon className="h-7 w-7" />
            Agenda de Férias
          </h2>
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              aria-label="Visualização em Lista"
              className="uppercase"
            >
              <List className="h-4 w-4 mr-2" /> Lista
            </Button>
            <Button 
              variant={viewMode === 'calendar' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('calendar')}
              aria-label="Visualização em Calendário"
              className="uppercase"
            >
              <CalendarIcon className="h-4 w-4 mr-2" /> Calendário
            </Button>
          </div>
        </div>

        <UpcomingVacationsAlert vacations={vacations} isLoading={isDataLoading} />

        {viewMode === 'list' ? (
          <div className="rounded-md border overflow-x-auto bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="uppercase">Colaborador</TableHead>
                  <TableHead className="uppercase">Período</TableHead>
                  <TableHead className="uppercase">Dias Úteis</TableHead>
                  <TableHead className="text-right uppercase">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isDataLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : vacations.length > 0 ? (
                  vacations.map((vacation) => (
                    <TableRow key={vacation.id}>
                      <TableCell className="font-medium uppercase">{vacation.user_full_name} ({vacation.user_initials})</TableCell>
                      <TableCell className="uppercase">
                        {format(new Date(vacation.start_date), 'dd/MM/yyyy', { locale: ptBR })} -{" "}
                        {format(new Date(vacation.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="uppercase">{vacation.working_days_count}</TableCell>
                      <TableCell className="text-right">
                        {user?.id === vacation.user_id && (
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
                                  <AlertDialogTitle className="uppercase">Tem certeza absoluta?</AlertDialogTitle>
                                  <AlertDialogDescription className="uppercase">
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente este pedido de férias.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="uppercase">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(vacation.id)} 
                                    className="bg-destructive hover:bg-destructive/90 uppercase"
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
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground uppercase">
                      Nenhum pedido de férias encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <VacationCalendar vacations={vacations} isLoading={isDataLoading} allProfiles={allProfiles} />
        )}
      </div>
      
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => handleOpenForm()}
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
            aria-label="Adicionar Férias"
          >
            <PlusCircle className="h-8 w-8" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="uppercase">{editingVacation ? "Editar Pedido de Férias" : "Novo Pedido de Férias"}</DialogTitle>
          </DialogHeader>
          <VacationForm
            initialData={editingVacation}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isPending={createVacation.isPending || updateVacation.isPending}
            allProfiles={allProfiles}
            currentUserId={user?.id || ''}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Vacations;