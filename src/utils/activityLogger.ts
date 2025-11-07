import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface ActivityLog {
  entity_type: 'service_order' | 'client' | 'equipment' | 'profile';
  entity_id: string;
  action_type: 'created' | 'updated' | 'deleted' | 'status_changed' | 'report_generated' | 'report_generation_failed'; // Adicionados novos tipos de ação
  content: string;
  details?: Record<string, any>;
}

export const logActivity = async (user: User | null, log: ActivityLog) => {
  if (!user) {
    console.error("Cannot log activity: user is not authenticated.");
    return;
  }

  console.log(`[ActivityLogger] Attempting to log activity for entity ${log.entity_type}/${log.entity_id}: ${log.content}`);

  const { error } = await supabase.from('activities').insert({
    user_id: user.id,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    action_type: log.action_type,
    content: log.content,
    details: log.details,
  });

  if (error) {
    console.error('[ActivityLogger] Error logging activity:', error);
  } else {
    console.log(`[ActivityLogger] Successfully logged activity for ${log.entity_type}/${log.entity_id}.`);
  }
};