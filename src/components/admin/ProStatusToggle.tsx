import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsProUser, useUserProfile } from '@/hooks/useUserProfile';
import { useQueryClient } from '@tanstack/react-query';

export const ProStatusToggle = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const isPro = useIsProUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleProStatus = async () => {
    if (!user?.id) return;
    
    setIsUpdating(true);
    try {
      const newProStatus = !isPro;
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          is_pro: newProStatus,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      
      toast({
        title: 'Success',
        description: `Pro status ${newProStatus ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating Pro status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update Pro status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isPro ? "default" : "secondary"} className="flex items-center gap-1">
        <Crown className="w-3 h-3" />
        {isPro ? 'Pro' : 'Free'}
      </Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleProStatus}
        disabled={isUpdating}
        className="text-xs"
      >
        {isUpdating && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
        Toggle Pro
      </Button>
    </div>
  );
};