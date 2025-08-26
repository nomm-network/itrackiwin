import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dumbbell } from "lucide-react";
import { useMissingEstimates, type MissingEstimate } from "@/features/workouts/hooks/useMissingEstimates";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface ReadinessData {
  energy: number;
  sleep_quality: number;
  sleep_hours: number;
  soreness: number;
  stress: number;
  illness: boolean;
  alcohol: boolean;
  supplements: string[];
  notes: string;
}

export interface EstimateData {
  [exerciseId: string]: number;
}

export interface EnhancedReadinessData {
  readiness: ReadinessData;
  estimates: EstimateData;
}

interface EnhancedReadinessCheckInProps {
  workoutId: string;
  onSubmit: (data: EnhancedReadinessData) => void;
  isLoading?: boolean;
}

const EnhancedReadinessCheckIn: React.FC<EnhancedReadinessCheckInProps> = ({ 
  workoutId, 
  onSubmit, 
  isLoading = false 
}) => {
  const { user } = useAuth();
  const { data: missingEstimates = [], isLoading: loadingEstimates } = useMissingEstimates(workoutId);
  const [estimates, setEstimates] = useState<EstimateData>({});

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReadinessData>({
    defaultValues: {
      energy: 7,
      sleep_quality: 7,
      sleep_hours: 8,
      soreness: 3,
      stress: 3,
      illness: false,
      alcohol: false,
      supplements: [],
      notes: ""
    }
  });

  const watchedValues = watch();

  const handleEstimateChange = (exerciseId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setEstimates(prev => ({ ...prev, [exerciseId]: numValue }));
    } else {
      setEstimates(prev => {
        const { [exerciseId]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleFormSubmit = async (readinessData: ReadinessData) => {
    try {
      console.log('🔍 EnhancedReadinessCheckIn: Submitting readiness data:', readinessData);
      console.log('🔍 EnhancedReadinessCheckIn: Submitting estimates:', estimates);
      
      const supplements = readinessData.supplements || [];
      const enhancedData: EnhancedReadinessData = {
        readiness: { ...readinessData, supplements },
        estimates
      };

      // Save estimates to database if any exist
      if (Object.keys(estimates).length > 0 && user?.id) {
        console.log('🔍 EnhancedReadinessCheckIn: Saving estimates to database...');
        
        const estimateRecords = Object.entries(estimates).map(([exerciseId, weight]) => ({
          user_id: user.id,
          exercise_id: exerciseId,
          estimated_weight: weight,
          type: '10RM',
          unit: 'kg',
          source: 'user_input'
        }));

        const { error: estimatesError } = await supabase
          .from('user_exercise_estimates')
          .insert(estimateRecords);

        if (estimatesError) {
          console.error('🔍 EnhancedReadinessCheckIn: Error saving estimates:', estimatesError);
          toast.error('Failed to save exercise estimates');
          return;
        }

        console.log('🔍 EnhancedReadinessCheckIn: Successfully saved estimates');
        toast.success(`Saved estimates for ${Object.keys(estimates).length} exercises`);
      }

      onSubmit(enhancedData);
    } catch (error) {
      console.error('🔍 EnhancedReadinessCheckIn: Error in form submission:', error);
      toast.error('Failed to submit readiness check');
    }
  };

  // Check if we need estimates but don't have them all filled
  const needsEstimates = missingEstimates.length > 0;
  const hasAllEstimates = needsEstimates ? missingEstimates.every(ex => estimates[ex.exercise_id]) : true;

  if (loadingEstimates) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading workout details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Pre-Workout Check</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Let's get you ready for the best workout possible
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Readiness Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How are you feeling today?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Energy Level */}
                <div className="space-y-2">
                  <Label>Energy Level: {watchedValues.energy}/10</Label>
                  <Slider
                    value={[watchedValues.energy]}
                    onValueChange={(value) => setValue("energy", value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Exhausted</span>
                    <span>Energized</span>
                  </div>
                </div>

                {/* Sleep Quality */}
                <div className="space-y-2">
                  <Label>Sleep Quality: {watchedValues.sleep_quality}/10</Label>
                  <Slider
                    value={[watchedValues.sleep_quality]}
                    onValueChange={(value) => setValue("sleep_quality", value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>

                {/* Sleep Hours */}
                <div className="space-y-2">
                  <Label>Sleep Hours</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    {...register("sleep_hours", { valueAsNumber: true })}
                    placeholder="8.0"
                  />
                </div>

                {/* Soreness */}
                <div className="space-y-2">
                  <Label>Muscle Soreness: {watchedValues.soreness}/10</Label>
                  <Slider
                    value={[watchedValues.soreness]}
                    onValueChange={(value) => setValue("soreness", value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>None</span>
                    <span>Very Sore</span>
                  </div>
                </div>

                {/* Stress */}
                <div className="space-y-2">
                  <Label>Stress Level: {watchedValues.stress}/10</Label>
                  <Slider
                    value={[watchedValues.stress]}
                    onValueChange={(value) => setValue("stress", value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Relaxed</span>
                    <span>Very Stressed</span>
                  </div>
                </div>

                {/* Illness */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="illness"
                    checked={watchedValues.illness}
                    onCheckedChange={(checked) => setValue("illness", checked)}
                  />
                  <Label htmlFor="illness">Feeling unwell or sick</Label>
                </div>

                {/* Alcohol */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="alcohol"
                    checked={watchedValues.alcohol}
                    onCheckedChange={(checked) => setValue("alcohol", checked)}
                  />
                  <Label htmlFor="alcohol">Had alcohol in last 24h</Label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2 mt-6">
                <Label>Additional Notes (optional)</Label>
                <Textarea
                  {...register("notes")}
                  placeholder="Any other factors affecting your readiness..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* First-Time Exercise Estimates */}
          {needsEstimates && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  First-Time Exercise Estimates
                  <Badge variant="secondary">{missingEstimates.length}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Estimate the weight you can lift for ~10 reps on these exercises. This helps us suggest appropriate warmup and working weights.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {missingEstimates.map((exercise: MissingEstimate) => (
                    <div key={exercise.exercise_id} className="space-y-2">
                      <Label className="font-medium">{exercise.exercise_name}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          placeholder="0"
                          value={estimates[exercise.exercise_id] || ''}
                          onChange={(e) => handleEstimateChange(exercise.exercise_id, e.target.value)}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">kg (~10 reps)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !hasAllEstimates}
            >
              {isLoading ? "Starting..." : "Start Workout"}
            </Button>
          </div>
          
          {needsEstimates && !hasAllEstimates && (
            <p className="text-sm text-muted-foreground text-center">
              Please provide estimates for all exercises to continue
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedReadinessCheckIn;