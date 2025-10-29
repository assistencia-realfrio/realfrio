import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface ActivityLog {
  entity_type: 'service_order' | 'client' | 'equipment';
  entity_id: string;
  action_type: 'created' | 'updated' | 'deleted' | 'status_changed';
  content: string;
  details?: Record<string, any>;
}

export const logActivity = async (user: User | null, log: ActivityLog) => {
  if (!user) {
    console.error("Cannot log activity: user is not authenticated.");
    return;
  }

  const { error } = await supabase.from('activities').insert({
    user_id: user.id,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    action_type: log.action_type,
    content: log.content,
    details: log.details,
  });

  if (error) {
    console.error('Error logging activity:', error);
  }
};