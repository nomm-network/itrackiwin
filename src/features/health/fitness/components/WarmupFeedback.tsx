import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useWarmupFeedback } from "@/features/workouts/warmup/useWarmupActions";

type WarmupQuality = 'not_enough' | 'excellent' | 'too_much';

interface WarmupFeedbackProps {
  exerciseId: string;
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
  exerciseId,
  onComplete,
  className
}) => {
  const { toast } = useToast();
  const saveFeedbackMutation = useWarmupFeedback();

  const handleFeedback = (quality: WarmupQuality) => {
    // Simplified for now - would need workoutExerciseId and userId
    console.log('Warmup feedback:', quality);
    const option = warmupOptions.find(opt => opt.value === quality);
    toast({
      title: "Feedback noted",
      description: option?.description,
    });
    onComplete?.();
  };

  return (
    <Card className={cn("p-3", className)}>
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-center">How was the warm-up? 👇🏻</h4>
        
        <div className="flex justify-center gap-2">
          {warmupOptions.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              onClick={() => handleFeedback(option.value)}
              disabled={saveFeedbackMutation.isPending}
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