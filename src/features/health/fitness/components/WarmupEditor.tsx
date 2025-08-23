import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WarmupEditorProps {
  exerciseId: string;
  exerciseName: string;
  children?: React.ReactNode;
}

interface WarmupData {
  id?: string;
  user_id: string;
  exercise_id: string;
  plan_text: string;
  created_at?: string;
  updated_at?: string;
}

export function WarmupEditor({ exerciseId, exerciseName, children }: WarmupEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [warmupText, setWarmupText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const queryClient = useQueryClient();

  // Fetch existing warmup
  const { data: existingWarmup, isLoading } = useQuery({
    queryKey: ['user-exercise-warmup', exerciseId],
    queryFn: async (): Promise<WarmupData | null> => {
      const { data, error } = await supabase
        .from('user_exercise_warmups')
        .select('*')
        .eq('exercise_id', exerciseId)
        .maybeSingle();
      
      if (error) throw error;
      return data ? {
        ...data,
        plan_text: data.plan_text || ''
      } : null;
    },
    enabled: isOpen
  });

  // Save warmup mutation
  const saveWarmupMutation = useMutation({
    mutationFn: async (text: string) => {
      if (existingWarmup) {
        // Update existing
        const { data, error } = await supabase
          .from('user_exercise_warmups')
          .update({ plan_text: text })
          .eq('id', existingWarmup.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Not authenticated');
        
        const { data, error } = await supabase
          .from('user_exercise_warmups')
          .insert({
            exercise_id: exerciseId,
            plan_text: text,
            user_id: user.user.id
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast.success('Warmup saved successfully');
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['user-exercise-warmup', exerciseId] });
    },
    onError: (error) => {
      console.error('Failed to save warmup:', error);
      toast.error('Failed to save warmup');
    }
  });

  // Load existing warmup text when data changes
  useEffect(() => {
    if (existingWarmup && !hasChanges) {
      setWarmupText(existingWarmup.plan_text || '');
    }
  }, [existingWarmup, hasChanges]);

  const handleSave = () => {
    if (warmupText.trim()) {
      saveWarmupMutation.mutate(warmupText.trim());
    }
  };

  const handleReset = () => {
    setWarmupText(existingWarmup?.plan_text || '');
    setHasChanges(false);
  };

  const handleTextChange = (value: string) => {
    setWarmupText(value);
    setHasChanges(value !== (existingWarmup?.plan_text || ''));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Edit Warmup
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent side="bottom" className="max-h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Warmup for {exerciseName}
          </SheetTitle>
          <SheetDescription>
            Create a personalized warmup routine for this exercise. This will be suggested before each workout.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="warmup-text">Warmup Instructions</Label>
            <Textarea
              id="warmup-text"
              placeholder="Describe your warmup routine... e.g., '5 minutes light cardio, 10 arm circles, 2 sets of 8 reps with empty bar'"
              value={warmupText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isLoading || saveWarmupMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              {warmupText.length}/500 characters
            </p>
          </div>

          {existingWarmup && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Last updated: {new Date(existingWarmup.updated_at || existingWarmup.created_at || '').toLocaleDateString()}
              </Badge>
            </div>
          )}
        </div>

        <SheetFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || saveWarmupMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges || !warmupText.trim() || saveWarmupMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveWarmupMutation.isPending ? 'Saving...' : 'Save Warmup'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}