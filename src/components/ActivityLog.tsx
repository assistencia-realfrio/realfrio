import React from 'react';
import { useActivities } from '@/hooks/useActivities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityLogProps {
  entityType: 'service_order' | 'client' | 'equipment';
  entityId: string;
}

// Componente auxiliar para renderizar os detalhes das alterações
const RenderActivityDetails: React.FC<{ details: Record<string, { oldValue?: any; newValue?: any }> | null }> = ({ details }) => {
  if (!details || Object.keys(details).length === 0) return null;

  return (
    <div className="mt-1 text-xs text-muted-foreground/80 space-y-0.5">
      {Object.entries(details).map(([key, { oldValue, newValue }]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()); // Formata 'status_changed' para 'Status Changed'
        
        if (oldValue === undefined && newValue !== undefined) {
          return (
            <p key={key} className="truncate"> {/* Adicionado truncate */}
              <span className="font-semibold">{formattedKey}:</span>{" "}
              <span className="text-green-500">{newValue || 'Vazio'}</span>
            </p>
          );
        } else if (oldValue !== undefined && newValue !== undefined && oldValue !== newValue) {
          return (
            <p key={key} className="truncate"> {/* Adicionado truncate */}
              <span className="font-semibold">{formattedKey}:</span>{" "}
              <span className="line-through text-red-500">{oldValue || 'Vazio'}</span>{" "}
              <span className="text-green-500">→ {newValue || 'Vazio'}</span>
            </p>
          );
        }
        return null; // Não renderiza se não houver alteração ou se for apenas oldValue
      })}
    </div>
  );
};

const ActivityLog: React.FC<ActivityLogProps> = ({ entityType, entityId }) => {
  const { data: activities, isLoading } = useActivities({ type: entityType, id: entityId });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Histórico de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities && activities.length > 0 ? (
          <ul className="space-y-4">
            {activities.map(activity => (
              <li key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {activity.user_full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0"> {/* Adicionado min-w-0 */}
                  <p className="text-sm text-foreground">{activity.content}</p>
                  <RenderActivityDetails details={activity.details} /> {/* Renderiza os detalhes aqui */}
                  <p className="text-xs text-muted-foreground">
                    {activity.user_full_name} • {activity.time_ago}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground text-sm">Nenhuma atividade registrada.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLog;