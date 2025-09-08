import React from "react";
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
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReadinessData>({
    defaultValues: {
      energy: 7,
      sleep_quality: 7,
      sleep_hours: 8,
      soreness: 3,
      stress: 3,
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

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              onClick={handleSubmit(async (data) => {
                try {
                  const score = await saveTodayReadiness({
                    energy: data.energy,
                    sleepQuality: data.sleep_quality,
                    sleepHours: data.sleep_hours,
                    soreness: data.soreness,
                    stress: data.stress,
                    preworkout: data.energisers_taken,
                  });
                  
                  toast.success(`Readiness logged: ${score}/100`);
                  onSubmit(data);
                } catch (error) {
                  console.error('Error saving readiness:', error);
                  toast.error('Failed to save readiness data');
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