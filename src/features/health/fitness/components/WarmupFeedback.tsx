import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSaveWarmupFeedback } from "../hooks/useWarmupPlan.hook";

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
  const saveFeedbackMutation = useSaveWarmupFeedback();

  const handleFeedback = (quality: WarmupQuality) => {
    saveFeedbackMutation.mutate({
      exerciseId,
      feedback: quality
    }, {
      onSuccess: () => {
        const option = warmupOptions.find(opt => opt.value === quality);
        toast({
          title: "Feedback saved",
          description: `Noted: ${option?.description}. ${quality === 'excellent' ? "I'll keep this for next time 👍" : "We'll adjust future warm-ups."}`,
        });
        onComplete?.();
      },
      onError: (error) => {
        console.error('Error saving warmup feedback:', error);
        toast({
          title: "Error",
          description: "Failed to save feedback. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

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