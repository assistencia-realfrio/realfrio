import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareText, Send } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    onSuccess: () => {
      setNewNoteContent("");
      queryClient.invalidateQueries({ queryKey: ['serviceOrderNotes', orderId] });
      showSuccess("Nota adicionada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao adicionar nota:", error);
      showError("Erro ao adicionar nota. Tente novamente.");
    },
  });

  const handleAddNote = () => {
    if (newNoteContent.trim() && !addNoteMutation.isPending) {
      addNoteMutation.mutate(newNoteContent);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5" />
          Notas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para adicionar nova nota */}
        <div className="space-y-3 border p-4 rounded-md">
          <h4 className="text-md font-semibold">Adicionar Nova Nota</h4>
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
            <ul className="space-y-4">
              {notes.map((note) => (
                <li key={note.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <p className="text-sm text-foreground mb-1">{note.content}</p>
                  <p className="text-xs text-muted-foreground">
                    Por <span className="font-medium">{note.user_full_name}</span> •{" "}
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground text-sm">Nenhuma nota adicionada ainda.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceOrderNotes;