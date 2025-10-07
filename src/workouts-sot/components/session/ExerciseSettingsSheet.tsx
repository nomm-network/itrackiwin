import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GripChips } from '@/features/exercises/ui';
import { useGrips } from '@/hooks/useGrips';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { workoutKeys } from '../../api/workouts-api';

interface ExerciseSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  exerciseId: string;
  workoutExerciseId: string;
  workoutId: string; // ADD THIS for cache invalidation
  
  // Grips
  selectedGripIds: string[];
  onGripsChange: (gripIds: string[]) => void;
  
  // Rep Range
  currentRepMin: number | null;
  currentRepMax: number | null;
  
  // Target Sets
  targetSets: number;
  
  // Unilateral
  isUnilateral: boolean;
  unilateralEnabled: boolean;
  onUnilateralEnabledChange: (enabled: boolean) => void;
  
  // Optional callbacks
  onRepRangeSave?: () => void;
  userId?: string;
  templateId?: string | null;
  programId?: string | null;
}

export function ExerciseSettingsSheet({
  open,
  onOpenChange,
  exerciseName,
  exerciseId,
  workoutExerciseId,
  workoutId,
  selectedGripIds,
  onGripsChange,
  currentRepMin,
  currentRepMax,
  targetSets,
  isUnilateral,
  unilateralEnabled,
  onUnilateralEnabledChange,
  onRepRangeSave,
  userId,
  templateId,
  programId,
}: ExerciseSettingsSheetProps) {
  
  // Handle unilateral toggle with preference saving
  const handleUnilateralChange = async (enabled: boolean) => {
    onUnilateralEnabledChange(enabled);
    
    // Save to preferences immediately
    if (userId && exerciseId) {
      try {
        // First check if preference exists
        let query = supabase
          .from('user_exercise_preferences')
          .select('id')
          .eq('user_id', userId)
          .eq('exercise_id', exerciseId);
        
        if (templateId) {
          query = query.eq('template_id', templateId);
        } else {
          query = query.is('template_id', null);
        }
        
        if (programId) {
          query = query.eq('program_id', programId);
        } else {
          query = query.is('program_id', null);
        }
        
        const { data: existing } = await query.maybeSingle();
        
        if (existing) {
          // Update existing
          const { error } = await supabase
            .from('user_exercise_preferences')
            .update({
              unilateral_enabled: enabled,
              last_updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
          
          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from('user_exercise_preferences')
            .insert({
              user_id: userId,
              exercise_id: exerciseId,
              template_id: templateId || null,
              program_id: programId || null,
              unilateral_enabled: enabled,
              last_updated_at: new Date().toISOString()
            });
          
          if (error) throw error;
        }
        
        toast.success('Unilateral setting saved');
      } catch (error) {
        console.error('Error saving unilateral preference:', error);
        toast.error('Failed to save unilateral setting');
      }
    }
  };
  const queryClient = useQueryClient();
  const { data: allGrips = [] } = useGrips();
  const [repMin, setRepMin] = useState(currentRepMin || 6);
  const [repMax, setRepMax] = useState(currentRepMax || 10);
  const [localTargetSets, setLocalTargetSets] = useState(targetSets);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSets, setIsSavingSets] = useState(false);
  const [loadedPreferences, setLoadedPreferences] = useState(false);

  // Load preferences when sheet opens
  useEffect(() => {
    const loadPreferences = async () => {
      if (!open || !userId || !exerciseId || loadedPreferences) return;
      
      try {
        // Build query with proper NULL handling
        let query = supabase
          .from('user_exercise_preferences')
          .select('preferred_rep_min, preferred_rep_max, preferred_target_sets, preferred_grip_ids')
          .eq('user_id', userId)
          .eq('exercise_id', exerciseId);
        
        // Handle template_id properly (NULL vs actual value)
        if (templateId) {
          query = query.eq('template_id', templateId);
        } else {
          query = query.is('template_id', null);
        }
        
        const { data, error } = await query.maybeSingle();
        
        if (error) {
          console.error('Error loading preferences:', error);
          return;
        }
        
        if (data) {
          console.log('Loaded preferences:', data);
          // Apply ALL preferences that exist
          if (data.preferred_rep_min !== null && data.preferred_rep_min !== undefined) {
            setRepMin(data.preferred_rep_min);
          }
          if (data.preferred_rep_max !== null && data.preferred_rep_max !== undefined) {
            setRepMax(data.preferred_rep_max);
          }
          if (data.preferred_target_sets !== null && data.preferred_target_sets !== undefined) {
            setLocalTargetSets(data.preferred_target_sets);
          }
          if (data.preferred_grip_ids && Array.isArray(data.preferred_grip_ids) && data.preferred_grip_ids.length > 0) {
            onGripsChange(data.preferred_grip_ids);
          }
        }
        
        setLoadedPreferences(true);
      } catch (error) {
        console.error('Error loading preferences:', error);
        setLoadedPreferences(true); // Still mark as loaded to prevent infinite loop
      }
    };
    
    if (open) {
      loadPreferences();
    } else {
      // Reset when sheet closes
      setLoadedPreferences(false);
    }
  }, [open, userId, exerciseId, templateId]);

  // Update state when props change
  useEffect(() => {
    if (!loadedPreferences) {
      setRepMin(currentRepMin || 6);
      setRepMax(currentRepMax || 10);
      setLocalTargetSets(targetSets);
    }
  }, [currentRepMin, currentRepMax, targetSets, workoutExerciseId, loadedPreferences]);

  // Filter grips for this exercise
  const exerciseGrips = allGrips.filter((grip: any) => {
    // You can filter by exercise default grips if needed
    return true; // For now, show all grips
  });

  const handleToggleGrip = async (gripId: string) => {
    // Single selection - replace instead of toggle
    const newSelection = [gripId];
    onGripsChange(newSelection);
    
    // Auto-save grips to workout_exercises and preferences
    try {
      const { error: workoutError } = await supabase
        .from('workout_exercises')
        .update({ grip_ids: newSelection })
        .eq('id', workoutExerciseId);

      if (workoutError) {
        console.error('Error saving grip to workout:', workoutError);
        toast.error('Failed to save grip to workout');
        throw workoutError;
      }

      if (userId && exerciseId) {
        // Check if preference exists
        let query = supabase
          .from('user_exercise_preferences')
          .select('id')
          .eq('user_id', userId)
          .eq('exercise_id', exerciseId);
        
        if (templateId) {
          query = query.eq('template_id', templateId);
        } else {
          query = query.is('template_id', null);
        }
        
        if (programId) {
          query = query.eq('program_id', programId);
        } else {
          query = query.is('program_id', null);
        }
        
        const { data: existing } = await query.maybeSingle();
        
        if (existing) {
          const { error: prefError } = await supabase
            .from('user_exercise_preferences')
            .update({
              preferred_grip_ids: newSelection,
              last_updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
          
          if (prefError) throw prefError;
        } else {
          const { error: prefError } = await supabase
            .from('user_exercise_preferences')
            .insert({
              user_id: userId,
              exercise_id: exerciseId,
              template_id: templateId || null,
              program_id: programId || null,
              preferred_grip_ids: newSelection,
              last_updated_at: new Date().toISOString()
            });
          
          if (prefError) throw prefError;
        }
      }
      
      toast.success('Grip saved');
    } catch (error) {
      console.error('Error saving grip:', error);
    }
  };

  const handleSaveSets = async () => {
    console.log('🔧 Saving sets:', { workoutExerciseId, localTargetSets, workoutId });
    setIsSavingSets(true);
    try {
      const { data, error: workoutError } = await supabase
        .from('workout_exercises')
        .update({ target_sets: localTargetSets })
        .eq('id', workoutExerciseId)
        .select();

      console.log('🔧 Update result:', { data, error: workoutError });

      if (workoutError) {
        console.error('Error updating workout sets:', workoutError);
        toast.error('Failed to update workout sets');
        throw workoutError;
      }

      // Save to preferences
      if (userId && exerciseId) {
        // Check if preference exists
        let query = supabase
          .from('user_exercise_preferences')
          .select('id')
          .eq('user_id', userId)
          .eq('exercise_id', exerciseId);
        
        if (templateId) {
          query = query.eq('template_id', templateId);
        } else {
          query = query.is('template_id', null);
        }
        
        if (programId) {
          query = query.eq('program_id', programId);
        } else {
          query = query.is('program_id', null);
        }
        
        const { data: existing } = await query.maybeSingle();
        
        if (existing) {
          const { error: prefError } = await supabase
            .from('user_exercise_preferences')
            .update({
              preferred_target_sets: localTargetSets,
              last_updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
          
          if (prefError) throw prefError;
        } else {
          const { error: prefError } = await supabase
            .from('user_exercise_preferences')
            .insert({
              user_id: userId,
              exercise_id: exerciseId,
              template_id: templateId || null,
              program_id: programId || null,
              preferred_target_sets: localTargetSets,
              last_updated_at: new Date().toISOString()
            });
          
          if (prefError) throw prefError;
        }
      }

      console.log('🔧 Sets saved successfully, invalidating cache for workout:', workoutId);
      toast.success('Target sets saved');
      
      // Force refetch instead of just invalidating
      console.log('🔧 Forcing refetch of workout data...');
      await queryClient.refetchQueries({ 
        queryKey: workoutKeys.byId(workoutId),
        exact: true 
      });
      
      console.log('🔧 Refetch complete, calling onRepRangeSave');
      onRepRangeSave?.();
      
      // Close the sheet after successful save
      setTimeout(() => onOpenChange(false), 300);
    } catch (error: any) {
      console.error('❌ Error updating target sets:', error);
      toast.error(`Failed to save: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSavingSets(false);
    }
  };

  const handleSaveRepRange = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        target_reps: null,
        target_reps_min: repMin,
        target_reps_max: repMax
      };

      const { error: workoutError } = await supabase
        .from('workout_exercises')
        .update(updateData)
        .eq('id', workoutExerciseId);

      if (workoutError) {
        console.error('Error updating workout rep range:', workoutError);
        toast.error('Failed to update workout rep range');
        throw workoutError;
      }

      // Save preferences if we have context
      if (userId && exerciseId) {
        // Check if preference exists
        let query = supabase
          .from('user_exercise_preferences')
          .select('id')
          .eq('user_id', userId)
          .eq('exercise_id', exerciseId);
        
        if (templateId) {
          query = query.eq('template_id', templateId);
        } else {
          query = query.is('template_id', null);
        }
        
        if (programId) {
          query = query.eq('program_id', programId);
        } else {
          query = query.is('program_id', null);
        }
        
        const { data: existing } = await query.maybeSingle();
        
        if (existing) {
          const { error: prefError } = await supabase
            .from('user_exercise_preferences')
            .update({
              preferred_rep_min: repMin,
              preferred_rep_max: repMax,
              last_updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
          
          if (prefError) throw prefError;
        } else {
          const { error: prefError } = await supabase
            .from('user_exercise_preferences')
            .insert({
              user_id: userId,
              exercise_id: exerciseId,
              template_id: templateId || null,
              program_id: programId || null,
              preferred_rep_min: repMin,
              preferred_rep_max: repMax,
              last_updated_at: new Date().toISOString()
            });
          
          if (prefError) throw prefError;
        }
      }

      toast.success('Rep range saved');
      onRepRangeSave?.();
    } catch (error) {
      console.error('Error updating rep range:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Exercise Settings</SheetTitle>
          <SheetDescription>
            Configure {exerciseName}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="grips" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="grips">Grips</TabsTrigger>
            <TabsTrigger value="sets">Sets</TabsTrigger>
            <TabsTrigger value="targets">Targets</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
          </TabsList>

          {/* Grips Tab */}
          <TabsContent value="grips" className="space-y-4">
            <div className="space-y-2">
              <Label>Selected Grips</Label>
              <p className="text-sm text-muted-foreground">
                Choose which grips to use for this exercise
              </p>
            </div>
            <GripChips
              grips={exerciseGrips.map((g: any) => ({
                id: g.id,
                name: g.translations?.[0]?.name || g.name || 'Unknown'
              }))}
              selectedGripIds={selectedGripIds}
              onToggleGrip={handleToggleGrip}
            />
          </TabsContent>

          {/* Sets Tab */}
          <TabsContent value="sets" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target_sets">Number of Sets</Label>
                <p className="text-sm text-muted-foreground">
                  How many sets do you want to complete for this exercise?
                </p>
              </div>
              
              <Input
                id="target_sets"
                type="number"
                value={localTargetSets}
                onChange={(e) => setLocalTargetSets(Number(e.target.value))}
                min={1}
                max={12}
                className="text-lg"
              />

              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4, 5, 6].map((num) => (
                  <Button
                    key={num}
                    type="button"
                    variant={localTargetSets === num ? "default" : "outline"}
                    onClick={() => setLocalTargetSets(num)}
                    className="h-12"
                  >
                    {num} sets
                  </Button>
                ))}
              </div>

              <Button 
                onClick={handleSaveSets} 
                disabled={isSavingSets || localTargetSets === targetSets}
                className="w-full"
                size="lg"
              >
                {isSavingSets ? 'Saving...' : 'Save Sets Configuration'}
              </Button>
            </div>
          </TabsContent>

          {/* Targets Tab - Rep Range only */}
          <TabsContent value="targets" className="space-y-6">
            {/* Rep Range */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rep Range</Label>
                <p className="text-sm text-muted-foreground">
                  Set your target rep range for this exercise
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rep_min">Min Reps</Label>
                  <Input
                    id="rep_min"
                    type="number"
                    value={repMin}
                    onChange={(e) => setRepMin(Number(e.target.value))}
                    min={1}
                    max={repMax - 1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rep_max">Max Reps</Label>
                  <Input
                    id="rep_max"
                    type="number"
                    value={repMax}
                    onChange={(e) => setRepMax(Number(e.target.value))}
                    min={repMin + 1}
                    max={100}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveRepRange} 
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? 'Saving...' : 'Save Rep Range'}
              </Button>
            </div>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            {isUnilateral ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="unilateral-toggle">Unilateral Training</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable unilateral training for better time and weight tracking
                    </p>
                  </div>
                  <Switch
                    id="unilateral-toggle"
                    checked={unilateralEnabled}
                    onCheckedChange={handleUnilateralChange}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                This exercise is not configured as unilateral. Side tracking is not available.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
