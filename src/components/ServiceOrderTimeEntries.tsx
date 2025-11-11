import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, PlusCircle, Send, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useTimeEntries, TimeEntry } from '@/hooks/useTimeEntries';
import { showSuccess, showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface ServiceOrderTimeEntriesProps {
  serviceOrderId: string;
}

const ServiceOrderTimeEntries: React.FC<ServiceOrderTimeEntriesProps> = ({ serviceOrderId }) => {
  const { timeEntries, isLoading, createTimeEntry, updateTimeEntry, deleteTimeEntry } = useTimeEntries(serviceOrderId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setStartTime('');
    setEndTime('');
    setDescription('');
    setEditingEntry(null);
  };

  const calculateDuration = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.round(diffMs / (1000 * 60)); // Diferença em minutos
  };

  const handleAddEntry = async () => {
    if (!startTime || !endTime) {
      showError("Por favor, preencha a hora de início e fim.");
      return;
    }
    const duration = calculateDuration(startTime, endTime);
    if (duration <= 0) {
      showError("A hora de fim deve ser posterior à hora de início.");
      return;
    }

    try {
      await createTimeEntry.mutateAsync({
        service_order_id: serviceOrderId,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: duration,
        description: description.trim() || null,
      });
      showSuccess("Registo de tempo adicionado com sucesso!");
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao adicionar registo de tempo:", error);
      showError("Erro ao adicionar registo de tempo. Tente novamente.");
    }
  };

  const handleEditClick = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setStartTime(format(new Date(entry.start_time), "yyyy-MM-dd'T'HH:mm"));
    setEndTime(format(new Date(entry.end_time), "yyyy-MM-dd'T'HH:mm"));
    setDescription(entry.description || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry || !startTime || !endTime) {
      showError("Por favor, preencha a hora de início e fim.");
      return;
    }
    const duration = calculateDuration(startTime, endTime);
    if (duration <= 0) {
      showError("A hora de fim deve ser posterior à hora de início.");
      return;
    }

    try {
      await updateTimeEntry.mutateAsync({
        id: editingEntry.id,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: duration,
        description: description.trim() || null,
      });
      showSuccess("Registo de tempo atualizado com sucesso!");
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao atualizar registo de tempo:", error);
      showError("Erro ao atualizar registo de tempo. Tente novamente.");
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteTimeEntry.mutateAsync(entryId);
      showSuccess("Registo de tempo removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover registo de tempo:", error);
      showError("Erro ao remover registo de tempo. Tente novamente.");
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}min` : ''}`.trim();
  };

  const totalDuration = timeEntries?.reduce((sum, entry) => sum + entry.duration_minutes, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Registo de Tempo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para adicionar nova entrada de tempo */}
        <div className="space-y-3 border p-4 rounded-md">
          <h4 className="text-md font-semibold">Adicionar Novo Registo</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Início *</Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={createTimeEntry.isPending}
              />
            </div>
            <div>
              <Label htmlFor="end-time">Fim *</Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={createTimeEntry.isPending}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="O que foi feito neste período?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              disabled={createTimeEntry.isPending}
            />
          </div>
          <Button
            onClick={handleAddEntry}
            disabled={!startTime || !endTime || createTimeEntry.isPending}
            className="w-full sm:w-auto"
          >
            {createTimeEntry.isPending ? "A adicionar..." : <><PlusCircle className="h-4 w-4 mr-2" /> Adicionar Registo</>}
          </Button>
        </div>

        {/* Lista de entradas de tempo existentes */}
        <div className="space-y-3">
          <h4 className="text-md font-semibold">Registos Anteriores ({formatDuration(totalDuration)} total):</h4>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : timeEntries && timeEntries.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto pr-2">
              <ul className="space-y-4">
                {timeEntries.map((entry) => (
                  <li key={entry.id} className="border-b pb-4 last:border-b-0 last:pb-0 flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(entry.start_time), 'dd/MM/yyyy HH:mm')} - {format(new Date(entry.end_time), 'HH:mm')} ({formatDuration(entry.duration_minutes)})
                      </p>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Por <span className="font-medium">{entry.user_full_name}</span> •{" "}
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações do Registo</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditClick(entry)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente este registo de tempo.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={deleteTimeEntry.isPending}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">Nenhum registo de tempo adicionado ainda.</p>
          )}
        </div>
      </CardContent>

      {/* Modal de Edição de Registo de Tempo */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Registo de Tempo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-start-time">Início *</Label>
              <Input
                id="edit-start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={updateTimeEntry.isPending}
              />
            </div>
            <div>
              <Label htmlFor="edit-end-time">Fim *</Label>
              <Input
                id="edit-end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={updateTimeEntry.isPending}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição (Opcional)</Label>
              <Textarea
                id="edit-description"
                placeholder="O que foi feito neste período?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={updateTimeEntry.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); resetForm(); }} disabled={updateTimeEntry.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={!startTime || !endTime || updateTimeEntry.isPending}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ServiceOrderTimeEntries;