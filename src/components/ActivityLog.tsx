import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send, MessageSquare } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface Activity {
  id: number;
  timestamp: string;
  user: string;
  content: string;
  type: 'note' | 'status_update';
}

interface ActivityLogProps {
  orderId: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ orderId }) => {
  // Inicializando com array vazio
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim() === "") return;

    const newActivity: Activity = {
      id: activities.length + 1,
      timestamp: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      user: "Usuário Atual", // Em um app real, seria o usuário logado
      content: newNote,
      type: 'note',
    };

    setActivities([newActivity, ...activities]);
    setNewNote("");
    showSuccess("Nota adicionada com sucesso!");
  };

  const renderActivity = (activity: Activity) => {
    const isNote = activity.type === 'note';
    
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
            {activity.user}
            <span className="text-xs text-muted-foreground ml-2 font-normal">
              {activity.timestamp}
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
          />
          <Button onClick={handleAddNote} disabled={newNote.trim() === ""}>
            <Send className="h-4 w-4 mr-2" />
            Enviar Nota
          </Button>
        </div>

        <Separator />

        {/* Histórico de Atividades */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {activities.length > 0 ? (
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