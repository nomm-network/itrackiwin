import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  action_type: string;
  target_user_id?: string;
  details?: Record<string, any>;
}

export function useSecurityMonitoring() {
  const logSecurityEvent = async (event: SecurityEvent) => {
    try {
      const { error } = await supabase.rpc('log_admin_action', {
        action_type: event.action_type,
        target_user_id: event.target_user_id || null,
        details: event.details || {}
      });
      
      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const logUserAction = (action: string, details?: Record<string, any>) => {
    logSecurityEvent({
      action_type: action,
      details
    });
  };

  const logAdminAction = (action: string, targetUserId?: string, details?: Record<string, any>) => {
    logSecurityEvent({
      action_type: action,
      target_user_id: targetUserId,
      details
    });
  };

  // Monitor for suspicious patterns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logUserAction('session_backgrounded', {
          timestamp: Date.now(),
          url: window.location.href
        });
      }
    };

    const handleBeforeUnload = () => {
      logUserAction('session_ended', {
        timestamp: Date.now(),
        url: window.location.href
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    logSecurityEvent,
    logUserAction,
    logAdminAction
  };
}