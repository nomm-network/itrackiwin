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

interface ExerciseSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  exerciseId: string;
  workoutExerciseId: string;
  
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
  const { data: allGrips = [] } = useGrips();
  const [repMin, setRepMin] = useState(currentRepMin || 6);
  const [repMax, setRepMax] = useState(currentRepMax || 10);
  const [isSaving, setIsSaving] = useState(false);

  // Update state when props change
  useEffect(() => {
    setRepMin(currentRepMin || 6);
    setRepMax(currentRepMax || 10);
  }, [currentRepMin, currentRepMax, workoutExerciseId]);

  // Filter grips for this exercise
  const exerciseGrips = allGrips.filter((grip: any) => {
    // You can filter by exercise default grips if needed
    return true; // For now, show all grips
  });

  const handleToggleGrip = (gripId: string) => {
    const newSelection = selectedGripIds.includes(gripId)
      ? selectedGripIds.filter(id => id !== gripId)
      : [...selectedGripIds, gripId];
    onGripsChange(newSelection);
  };

  const handleSaveRepRange = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        target_reps: null,
        target_reps_min: repMin,
        target_reps_max: repMax
      };

      const { error } = await supabase
        .from('workout_exercises')
        .update(updateData)
        .eq('id', workoutExerciseId);

      if (error) throw error;

      // Save preferences if we have context
      if (userId && exerciseId) {
        const { error: prefError } = await supabase
          .from('user_exercise_preferences')
          .upsert({
            user_id: userId,
            exercise_id: exerciseId,
            template_id: templateId || null,
            program_id: programId || null,
            preferred_rep_min: repMin,
            preferred_rep_max: repMax,
            last_updated_at: new Date().toISOString()
          });

        if (prefError) {
          console.warn('Failed to save preference:', prefError);
        }
      }

      toast.success('Rep target updated');
      onRepRangeSave?.();
    } catch (error) {
      console.error('Error updating rep target:', error);
      toast.error('Failed to update rep target');
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grips">Grips</TabsTrigger>
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

          {/* Targets Tab */}
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

            <Separator />

            {/* Target Sets (Read-only for now) */}
            <div className="space-y-2">
              <Label>Target Sets</Label>
              <p className="text-sm text-muted-foreground">
                Number of sets planned: <strong>{targetSets}</strong>
              </p>
            </div>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            {isUnilateral ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="unilateral-toggle">Track Side Independently</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable to track left/right sides separately
                    </p>
                  </div>
                  <Switch
                    id="unilateral-toggle"
                    checked={unilateralEnabled}
                    onCheckedChange={onUnilateralEnabledChange}
                  />
                </div>
                
                {unilateralEnabled && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm">
                      Side tracking enabled. You'll be able to log each side separately when logging sets.
                    </p>
                  </div>
                )}
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
