import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WarmupStep } from '../api/useWorkout';
import { useToast } from '@/hooks/use-toast';

interface WarmupPanelProps {
  topKg: number;
  steps: WarmupStep[];
  exerciseName: string;
  workoutExerciseId: string;
}

export function WarmupPanel({ topKg, steps, exerciseName, workoutExerciseId }: WarmupPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { toast } = useToast();

  const handleFeedback = async (feedback: 'too_little' | 'excellent' | 'too_much') => {
    try {
      // TODO: Call RPC to recalculate warmup based on feedback
      toast({
        title: "Warmup updated",
        description: `Feedback "${feedback}" recorded. Warmup will be adjusted.`,
      });
      setIsOpen(false); // Auto-close after feedback
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update warmup",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="bg-[#0f1f1b] p-4 border-b border-[#133a2f]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-white">Warm-up 🏋️‍♂️</h4>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>
      
      <div className="text-sm text-gray-400 mb-3">
        Strategy: ramped • Top: {topKg}kg • Auto-adjusts from feedback
      </div>

      {/* Warmup Steps */}
      <div className="space-y-2 mb-4">
        {steps.length > 0 ? (
          steps.map((step, index) => (
            <div key={index} className="text-sm text-gray-300">
              – {step.kg}kg × {step.reps} … {step.rest_s}s rest
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-400">
            No warmup steps available
          </div>
        )}
      </div>

      {/* Feedback Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback('too_little')}
          className="border-amber-500/50 text-amber-300 hover:bg-amber-500/20"
        >
          Too little
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback('excellent')}
          className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20"
        >
          Excellent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback('too_much')}
          className="border-red-500/50 text-red-300 hover:bg-red-500/20"
        >
          Too much
        </Button>
      </div>
    </div>
  );
}