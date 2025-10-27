import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send, MessageSquare } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { useOrderActivities, OrderActivity } from "@/hooks/useOrderActivities"; // Importar o novo hook
import { useSession } from "@/contexts/SessionContext"; // Para obter o nome do usuário
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityLogProps {
  orderId: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ orderId }) => {
  const { user } = useSession();
  const { activities, isLoading, createActivity } = useOrderActivities(orderId);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = async () => {
    if (newNote.trim() === "") return;

    try {
      await createActivity.mutateAsync({
        order_id: orderId,
        content: newNote.trim(),
        type: 'note',
      });
      setNewNote("");
      showSuccess("Nota adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar nota:", error);
      showError("Erro ao adicionar nota. Tente novamente.");
    }
  };

  const getUserDisplayName = (activity: OrderActivity) => {
    if (activity.profiles && activity.profiles.first_name) {
      return `${activity.profiles.first_name} ${activity.profiles.last_name || ''}`.trim();
    }
    return user?.email || "Usuário Desconhecido"; // Fallback para email ou genérico
  };

  const renderActivity = (activity: OrderActivity) => {
    const isNote = activity.type === 'note';
    const activityDate = new Date(activity.created_at).toLocaleDateString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    
    return (
      <div key={activity.id} className={`flex space-x-3 ${isNote ? 'p-3 bg-muted/50 rounded-md' : 'py-2'}`}>
        <div className="flex-shrink-0 pt-1">
          {isNote ? (
            <MessageSquare className="h-4 w-4 text-primary" />
          ) : (
            <span className="h-2 w-2 block rounded-full bg-gray-400 mt-2.5" />
          )}
        </div>
        <div className="flex-grow">
          <p className="text-sm font-medium">
            {getUserDisplayName(activity)}
            <span className="text-xs text-muted-foreground ml-2 font-normal">
              {activityDate}
            </span>
          </p>
          <p className={`text-sm ${isNote ? 'text-foreground' : 'text-muted-foreground italic'}`}>
            {activity.content}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Atividades (OS: {orderId})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Adicionar Nova Nota */}
        <div className="space-y-3">
          <Textarea
            placeholder="Adicionar nota ou atualização..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            disabled={createActivity.isPending}
          />
          <Button onClick={handleAddNote} disabled={newNote.trim() === "" || createActivity.isPending}>
            <Send className="h-4 w-4 mr-2" />
            Enviar Nota
          </Button>
        </div>

        <Separator />

        {/* Histórico de Atividades */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : activities.length > 0 ? (
            activities.map(renderActivity)
          ) : (
            <p className="text-center text-muted-foreground">Nenhuma atividade registrada ainda.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;