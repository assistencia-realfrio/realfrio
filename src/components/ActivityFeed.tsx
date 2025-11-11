import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, Zap } from 'lucide-react';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityFeedProps {
  entityType: 'client' | 'equipment' | 'service_order';
  entityId: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ entityType, entityId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('activities')
          .select(`
            *,
            profiles (first_name, last_name)
          `)
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setActivities(data as Activity[]);
      } catch (error) {
        console.error('Error fetching activities:', error);
        showError('Erro ao carregar o feed de atividades.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [entityType, entityId]);

  const formatUserName = (activity: Activity) => {
    const profile = (activity as any).profiles;
    if (profile && profile.first_name) {
      return `${profile.first_name} ${profile.last_name || ''}`;
    }
    return 'Usuário Desconhecido';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Feed de Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">Nenhuma atividade recente.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex space-x-3">
                <Zap className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.content}</p>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <User className="h-3 w-3 mr-1" />
                    <span>{formatUserName(activity)}</span>
                    <Clock className="h-3 w-3 ml-3 mr-1" />
                    <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;