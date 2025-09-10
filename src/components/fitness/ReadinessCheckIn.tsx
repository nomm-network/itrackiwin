import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveTodayReadiness } from "@/lib/readiness";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface ReadinessData {
  energy: number;
  sleep_quality: number;
  sleep_hours: number;
  soreness: number;
  stress: number;
  illness: boolean;
  alcohol: boolean;
  energisers_taken: boolean;
  supplements: string[];
  notes: string;
}

interface ReadinessCheckInProps {
  onSubmit: (data: ReadinessData) => void;
  isLoading?: boolean;
}

const ReadinessCheckIn: React.FC<ReadinessCheckInProps> = ({ onSubmit, isLoading = false }) => {
  const { user } = useAuth();
  const [debugError, setDebugError] = useState<string | null>(null);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReadinessData>({
    defaultValues: {
      energy: 7,
      sleep_quality: 7,
      sleep_hours: 8,
      soreness: 0,
      stress: 0,
      illness: false,
      alcohol: false,
      energisers_taken: false,
      supplements: [],
      notes: ""
    }
  });

  const watchedValues = watch();

  const handleFormSubmit = (data: ReadinessData) => {
    const supplements = data.supplements || [];
    onSubmit({ ...data, supplements });
  };

  // Show authentication message if user is not logged in
  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Please Log In</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            You need to be logged in to track your readiness data.
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">How are you feeling today?</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          This helps us personalize your workout suggestions
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Energy Level */}
            <div className="space-y-2">
              <Label>Energy Level: {watchedValues.energy}/10</Label>
              <Slider
                value={[watchedValues.energy]}
                onValueChange={(value) => setValue("energy", value[0])}
                max={10}
                min={0}
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
                min={0}
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
                min={0}
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
                min={0}
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

            {/* Energisers */}
            <div className="flex items-center space-x-2">
              <Switch
                id="energisers_taken"
                checked={watchedValues.energisers_taken}
                onCheckedChange={(checked) => setValue("energisers_taken", checked)}
              />
              <Label htmlFor="energisers_taken">Creatine/PreWorkout taken</Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (optional)</Label>
            <Textarea
              {...register("notes")}
              placeholder="Any other factors affecting your readiness..."
              rows={3}
            />
          </div>

          {/* Debug Error Display */}
          {debugError && (
            <Card className="mt-4 border-destructive bg-destructive/10">
              <CardHeader>
                <CardTitle className="text-destructive text-sm">🐛 DEBUG ERROR DETAILS</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40 text-destructive">
                  {debugError}
                </pre>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={() => setDebugError(null)}
                >
                  Clear Debug
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              onClick={handleSubmit(async (data) => {
                try {
                  setDebugError(null); // Clear previous errors
                  console.log('🚀 Form submitted with data:', data);
                  
                  const inputData = {
                    energy: data.energy,
                    sleepQuality: data.sleep_quality,
                    sleepHours: data.sleep_hours,
                    soreness: data.soreness,
                    stress: data.stress,
                    preworkout: data.energisers_taken,
                  };
                  
                  console.log('🔄 Calling saveTodayReadiness with:', inputData);
                  console.log('🔍 User authenticated:', !!user, user?.id);
                  
                  const score = await saveTodayReadiness(inputData);
                  
                  console.log('✅ saveTodayReadiness returned score:', score);
                  toast.success(`Readiness logged: ${score}/100`);
                  onSubmit(data);
                } catch (error) {
                  console.error('❌ Error saving readiness:', error);
                  
                  // Detailed error information for debug box
                  const errorDetails = {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : null,
                    name: error instanceof Error ? error.name : 'UnknownError',
                    user: user ? { id: user.id, email: user.email } : 'Not authenticated',
                    timestamp: new Date().toISOString(),
                    formData: data,
                    inputData: {
                      energy: data.energy,
                      sleepQuality: data.sleep_quality,
                      sleepHours: data.sleep_hours,
                      soreness: data.soreness,
                      stress: data.stress,
                      preworkout: data.energisers_taken,
                    }
                  };
                  
                  setDebugError(JSON.stringify(errorDetails, null, 2));
                  toast.error('Failed to save readiness data - Check debug info below');
                }
              })}
            >
              {isLoading ? "Starting..." : "Start Workout"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReadinessCheckIn;