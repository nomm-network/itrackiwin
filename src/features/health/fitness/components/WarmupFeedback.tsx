import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type WarmupQuality = 'not_enough' | 'excellent' | 'too_much';

interface WarmupFeedbackProps {
  workoutExerciseId: string;
  onComplete?: () => void;
  className?: string;
}

const warmupOptions: Array<{
  value: WarmupQuality;
  label: string;
  emoji: string;
  description: string;
}> = [
  {
    value: 'not_enough',
    label: 'Not enough',
    emoji: '🥶',
    description: 'Needed more warm-up'
  },
  {
    value: 'excellent',
    label: 'Excellent',
    emoji: '🔥',
    description: 'Perfect warm-up'
  },
  {
    value: 'too_much',
    label: 'Too much',
    emoji: '🥵',
    description: 'Over-warmed up'
  }
];

const WarmupFeedback: React.FC<WarmupFeedbackProps> = ({
  workoutExerciseId,
  onComplete,
  className
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveFeedback = useMutation({
    mutationFn: async (quality: WarmupQuality) => {
      const { error } = await supabase
        .from('workout_exercise_feedback')
        .upsert({
          workout_exercise_id: workoutExerciseId,
          warmup_quality: quality,
        });

      if (error) throw error;
    },
    onSuccess: (_, quality) => {
      const option = warmupOptions.find(opt => opt.value === quality);
      toast({
        title: "Feedback saved",
        description: `Noted: ${option?.description}. We'll adjust future warm-ups.`,
      });
      queryClient.invalidateQueries({ queryKey: ['workout-feedback'] });
      onComplete?.();
    },
    onError: (error) => {
      console.error('Error saving warmup feedback:', error);
    },
  });

  return (
    <Card className={cn("p-3", className)}>
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-center">How was the warm-up?</h4>
        
        <div className="flex justify-center gap-2">
          {warmupOptions.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              onClick={() => saveFeedback.mutate(option.value)}
              disabled={saveFeedback.isPending}
              className="flex flex-col items-center p-2 h-auto min-w-[80px]"
            >
              <span className="text-lg">{option.emoji}</span>
              <span className="text-xs">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default WarmupFeedback;