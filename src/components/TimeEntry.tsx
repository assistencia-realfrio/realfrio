import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Plus } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Badge } from "@/components/ui/badge";

interface TimeEntry {
  id: number;
  date: string;
  duration: number; // in hours
  description: string;
  user: string;
}

interface TimeEntryProps {
  orderId: string;
}

const TimeEntryComponent: React.FC<TimeEntryProps> = ({ orderId }) => {
  // Inicializando com array vazio
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  const totalTime = entries.reduce((sum, entry) => sum + entry.duration, 0);

  const handleAddTimeEntry = () => {
    const parsedDuration = parseFloat(duration);

    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      showError("Duração inválida. Use um número positivo.");
      return;
    }
    if (description.trim().length < 5) {
      showError("A descrição do tempo deve ter pelo menos 5 caracteres.");
      return;
    }

    const newEntry: TimeEntry = {
      id: entries.length + 1,
      date: new Date().toISOString().split('T')[0],
      duration: parsedDuration,
      description: description.trim(),
      user: "Usuário Atual",
    };

    setEntries([...entries, newEntry]);
    setDuration("");
    setDescription("");
    showSuccess("Tempo registrado com sucesso!");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Registro de Tempo
        </CardTitle>
        <div className="text-lg font-bold text-primary">
          Total: {totalTime.toFixed(1)}h
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário de Adição de Tempo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border p-4 rounded-md">
          <div className="space-y-2">
            <Label htmlFor="duration">Duração (horas)</Label>
            <Input
              id="duration"
              type="number"
              step="0.1"
              placeholder="Ex: 3.5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="time-description">Descrição do Trabalho</Label>
            <div className="flex gap-2">
              <Input
                id="time-description"
                placeholder="O que foi feito?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button onClick={handleAddTimeEntry} size="icon" disabled={!duration || !description}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Entradas de Tempo */}
        <div className="space-y-3">
          <h4 className="text-md font-semibold">Entradas Registradas:</h4>
          {entries.length > 0 ? (
            <div className="divide-y">
              {entries.map((entry) => (
                <div key={entry.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.user} em {entry.date}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {entry.duration.toFixed(1)}h
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">Nenhum tempo registrado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeEntryComponent;