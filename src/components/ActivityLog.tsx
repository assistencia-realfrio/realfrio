import React from 'react';
import { useActivities } from '@/hooks/useActivities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { List } from 'lucide-react';

interface ActivityLogProps {
  entityType: 'service_order' | 'client' | 'equipment';
  entityId: string;
}

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
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.content}</p>
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