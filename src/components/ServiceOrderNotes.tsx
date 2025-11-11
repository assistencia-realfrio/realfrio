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
    const userFullName = `${firstName} ${lastName}`.trim() || 'USUÁRIO DESCONHECIDO';

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
      if (!user?.id) throw new Error("USUÁRIO NÃO AUTENTICADO.");

      const { data, error } = await supabase
        .from('service_order_notes')
        .insert({
          service_order_id: orderId,
          user_id: user.id,
          content: content.toUpperCase(), // Convert to uppercase before saving
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newNote) => {
      setNewNoteContent("");
      queryClient.invalidateQueries({ queryKey: ['serviceOrderNotes', orderId] });
      logActivity(user, {
        entity_type: 'service_order',
        entity_id: orderId,
        action_type: 'created',
        content: `ADICIONOU UMA NOTA À OS.`,
        details: { noteContent: { newValue: newNote.content } }
      });
      showSuccess("NOTA ADICIONADA COM SUCESSO!");
    },
    onError: (error) => {
      console.error("Erro ao adicionar nota:", error);
      showError("ERRO AO ADICIONAR NOTA. TENTE NOVAMENTE.");
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      if (!user?.id) throw new Error("USUÁRIO NÃO AUTENTICADO.");

      const { data, error } = await supabase
        .from('service_order_notes')
        .update({ content: content.toUpperCase() }) // Convert to uppercase before saving
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
        content: `EDITOU UMA NOTA NA OS.`,
        details: { noteContent: { newValue: updatedNote.content } }
      });
      showSuccess("NOTA ATUALIZADA COM SUCESSO!");
      setIsEditModalOpen(false);
      setEditingNote(null);
      setEditedContent("");
    },
    onError: (error) => {
      console.error("Erro ao atualizar nota:", error);
      showError("ERRO AO ATUALIZAR NOTA. TENTE NOVAMENTE.");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("USUÁRIO NÃO AUTENTICADO.");

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
      logActivity(user, {
        entity_type: 'service_order',
        entity_id: orderId,
        action_type: 'deleted',
        content: `REMOVEU UMA NOTA DA OS.`,
        details: { noteId: { oldValue: deletedNoteId, newValue: 'REMOVIDO' } }
      });
      showSuccess("NOTA REMOVIDA COM SUCESSO!");
    },
    onError: (error) => {
      console.error("Erro ao remover nota:", error);
      showError("ERRO AO REMOVER NOTA. TENTE NOVAMENTE.");
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5" />
          NOTAS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para adicionar nova nota */}
        <div className="space-y-3 border p-4 rounded-md">
          <h4 className="text-md font-semibold">ADICIONAR NOVA NOTA</h4>
          <Textarea
            placeholder="ESCREVA SUA NOTA AQUI..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value.toUpperCase())} // Convert to uppercase
            rows={3}
            disabled={addNoteMutation.isPending}
          />
          <Button 
            onClick={handleAddNote} 
            disabled={!newNoteContent.trim() || addNoteMutation.isPending}
            className="w-full sm:w-auto"
          >
            {addNoteMutation.isPending ? "A ENVIAR..." : <><Send className="h-4 w-4 mr-2" /> ENVIAR NOTA</>}
          </Button>
        </div>

        {/* Lista de notas existentes */}
        <div className="space-y-3">
          <h4 className="text-md font-semibold">NOTAS ANTERIORES:</h4>
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
                      <p className="text-sm text-foreground mb-1">{note.content.toUpperCase()}</p> {/* Display in uppercase */}
                      <p className="text-xs text-muted-foreground">
                        POR <span className="font-medium">{note.user_full_name.toUpperCase()}</span> •{" "}
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ptBR }).toUpperCase()}
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
                          <DropdownMenuLabel>AÇÕES DA NOTA</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditClick(note)}>
                            <Edit className="mr-2 h-4 w-4" /> EDITAR
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> EXCLUIR
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>TEM CERTEZA ABSOLUTA?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ESTA AÇÃO NÃO PODE SER DESFEITA. ISSO EXCLUIRÁ PERMANENTEMENTE ESTA NOTA.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>CANCELAR</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteNoteMutation.mutate(note.id)} 
                                  className="bg-destructive hover:bg-destructive/90"
                                  disabled={deleteNoteMutation.isPending}
                                >
                                  EXCLUIR
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
            <p className="text-center text-muted-foreground text-sm">NENHUMA NOTA ADICIONADA AINDA.</p>
          )}
        </div>
      </CardContent>

      {/* Modal de Edição de Nota */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>EDITAR NOTA</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value.toUpperCase())} // Convert to uppercase
              rows={5}
              disabled={updateNoteMutation.isPending}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit} disabled={updateNoteMutation.isPending}>
              CANCELAR
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editedContent.trim() || updateNoteMutation.isPending}>
              SALVAR ALTERAÇÕES
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ServiceOrderNotes;