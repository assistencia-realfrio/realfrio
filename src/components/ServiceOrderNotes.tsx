import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareText, Send, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
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
import { logActivity } from "@/utils/activityLogger";

interface Note {
  id: string;
  service_order_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
  user_full_name: string;
}

interface ServiceOrderNotesProps {
  orderId: string;
}

const fetchNotes = async (orderId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('service_order_notes')
    .select(`
      *,
      profiles (first_name, last_name)
    `)
    .eq('service_order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((note: any) => {
    const firstName = note.profiles?.first_name || '';
    const lastName = note.profiles?.last_name || '';
    const userFullName = `${firstName} ${lastName}`.trim() || 'Usuário Desconhecido';

    return {
      id: note.id,
      service_order_id: note.service_order_id,
      user_id: note.user_id,
      content: note.content,
      created_at: note.created_at,
      user_full_name: userFullName,
    };
  });
};

const ServiceOrderNotes: React.FC<ServiceOrderNotesProps> = ({ orderId }) => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const { data: notes, isLoading: isLoadingNotes } = useQuery<Note[], Error>({
    queryKey: ['serviceOrderNotes', orderId],
    queryFn: () => fetchNotes(orderId),
    enabled: !!orderId,
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const { data, error } = await supabase
        .from('service_order_notes')
        .insert({
          service_order_id: orderId,
          user_id: user.id,
          content: content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newNote) => {
      setNewNoteContent("");
      queryClient.invalidateQueries({ queryKey: ['serviceOrderNotes', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orderNotesCount', orderId] }); // Invalida a contagem
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); // Invalida a lista de OS
      logActivity(user, {
        entity_type: 'service_order',
        entity_id: orderId,
        action_type: 'created',
        content: `Adicionou uma nota à OS.`,
        details: { noteContent: { newValue: newNote.content } }
      });
      showSuccess("Nota adicionada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao adicionar nota:", error);
      showError("Erro ao adicionar nota. Tente novamente.");
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const { data, error } = await supabase
        .from('service_order_notes')
        .update({ content: content })
        .eq('id', id)
        .eq('user_id', user.id) // Garante que apenas o próprio utilizador pode editar
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrderNotes', orderId] });
      logActivity(user, {
        entity_type: 'service_order',
        entity_id: orderId,
        action_type: 'updated',
        content: `Editou uma nota na OS.`,
        details: { noteContent: { newValue: updatedNote.content } }
      });
      showSuccess("Nota atualizada com sucesso!");
      setIsEditModalOpen(false);
      setEditingNote(null);
      setEditedContent("");
    },
    onError: (error) => {
      console.error("Erro ao atualizar nota:", error);
      showError("Erro ao atualizar nota. Tente novamente.");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const { error } = await supabase
        .from('service_order_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Garante que apenas o próprio utilizador pode excluir

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedNoteId) => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrderNotes', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orderNotesCount', orderId] }); // Invalida a contagem
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); // Invalida a lista de OS
      logActivity(user, {
        entity_type: 'service_order',
        entity_id: orderId,
        action_type: 'deleted',
        content: `Removeu uma nota da OS.`,
        details: { noteId: { oldValue: deletedNoteId, newValue: 'Removido' } }
      });
      showSuccess("Nota removida com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao remover nota:", error);
      showError("Erro ao remover nota. Tente novamente.");
    },
  });

  const handleAddNote = () => {
    if (newNoteContent.trim() && !addNoteMutation.isPending) {
      addNoteMutation.mutate(newNoteContent);
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setEditedContent(note.content);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingNote && editedContent.trim() && !updateNoteMutation.isPending) {
      updateNoteMutation.mutate({ id: editingNote.id, content: editedContent });
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingNote(null);
    setEditedContent("");
  };

  return (
    <Card className="shadow-md"> {/* Adicionado shadow-md aqui */}
      {/* CardHeader removido conforme solicitado */}
      <CardContent className="space-y-6 pt-6"> {/* Adicionado pt-6 aqui para padding superior */}
        {/* Formulário para adicionar nova nota */}
        <div className="space-y-3 border p-4 rounded-md">
          <Textarea
            placeholder="Escreva sua nota aqui..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            rows={3}
            disabled={addNoteMutation.isPending}
          />
          <Button 
            onClick={handleAddNote} 
            disabled={!newNoteContent.trim() || addNoteMutation.isPending}
            className="w-full sm:w-auto"
          >
            {addNoteMutation.isPending ? "A enviar..." : <><Send className="h-4 w-4 mr-2" /> Enviar Nota</>}
          </Button>
        </div>

        {/* Lista de notas existentes */}
        <div className="space-y-3">
          <h4 className="text-md font-semibold">Notas Anteriores:</h4>
          {isLoadingNotes ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : notes && notes.length > 0 ? (
            <div className="max-h-[200px] overflow-y-auto pr-2">
              <ul className="space-y-4">
                {notes.map((note) => (
                  <li key={note.id} className="border-b pb-4 last:border-b-0 last:pb-0 flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground mb-1">{note.content}</p>
                      <p className="text-xs text-muted-foreground">
                        Por <span className="font-medium">{note.user_full_name}</span> •{" "}
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    {user?.id === note.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações da Nota</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditClick(note)}>
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
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente esta nota.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteNoteMutation.mutate(note.id)} 
                                  className="bg-destructive hover:bg-destructive/90"
                                  disabled={deleteNoteMutation.isPending}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">Nenhuma nota adicionada ainda.</p>
          )}
        </div>
      </CardContent>

      {/* Modal de Edição de Nota */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Nota</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={5}
              disabled={updateNoteMutation.isPending}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit} disabled={updateNoteMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editedContent.trim() || updateNoteMutation.isPending}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ServiceOrderNotes;