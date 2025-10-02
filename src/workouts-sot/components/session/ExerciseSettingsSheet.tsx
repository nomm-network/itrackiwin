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
  const [localTargetSets, setLocalTargetSets] = useState(targetSets);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSets, setIsSavingSets] = useState(false);

  // Update state when props change
  useEffect(() => {
    setRepMin(currentRepMin || 6);
    setRepMax(currentRepMax || 10);
    setLocalTargetSets(targetSets);
  }, [currentRepMin, currentRepMax, targetSets, workoutExerciseId]);

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

  const handleSaveSets = async () => {
    setIsSavingSets(true);
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .update({ target_sets: localTargetSets })
        .eq('id', workoutExerciseId);

      if (error) throw error;

      toast.success('Target sets updated');
      onRepRangeSave?.();
    } catch (error) {
      console.error('Error updating target sets:', error);
      toast.error('Failed to update target sets');
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
                    onCheckedChange={onUnilateralEnabledChange}
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
