import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useWarmupManager } from "@/features/workouts/hooks/useWarmupManager";
import { WarmupFeedback as WarmupFeedbackType } from "@/features/workouts/types/warmup-unified";

interface WarmupFeedbackProps {
  workoutExerciseId: string;
  onComplete?: () => void;
  className?: string;
}

const warmupOptions: Array<{
  value: WarmupFeedbackType;
  label: string;
  emoji: string;
  description: string;
}> = [
  {
    value: 'too_little',
    label: 'Too little',
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
  const { saveFeedback, isLoading } = useWarmupManager();

  const handleFeedback = async (quality: WarmupFeedbackType) => {
    try {
      await saveFeedback({
        workoutExerciseId,
        feedback: quality
      });
      
      const option = warmupOptions.find(opt => opt.value === quality);
      toast({
        title: "Feedback saved",
        description: option?.description,
      });
      onComplete?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save feedback",
        variant: "destructive"
      });
    }
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
              disabled={isLoading}
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