import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface TenRMEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  exerciseName: string;
}

const TenRMEstimateModal: React.FC<TenRMEstimateModalProps> = ({
  isOpen,
  onClose,
  exerciseId,
  exerciseName,
}) => {
  const [weight, setWeight] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveEstimate = useMutation({
    mutationFn: async (estimatedWeight: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_exercise_estimates')
        .upsert({
          user_id: user.id,
          exercise_id: exerciseId,
          type: 'rm10',
          estimated_weight: estimatedWeight,
          unit: 'kg',
          source: 'user_prompt',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Estimate saved",
        description: "Your 10RM estimate has been recorded. We'll use this to suggest starting weights.",
      });
      queryClient.invalidateQueries({ queryKey: ['exercise-estimates'] });
      onClose();
      setWeight("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save estimate: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    
    if (!weightNum || weightNum <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight greater than 0.",
        variant: "destructive",
      });
      return;
    }

    saveEstimate.mutate(weightNum);
  };

  const handleSkip = () => {
    // Save a placeholder estimate so we don't ask again
    saveEstimate.mutate(40); // Default starting weight
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>First time doing {exerciseName}?</DialogTitle>
          <DialogDescription>
            To give you better suggestions, what weight could you do for about 10 clean reps?
            This helps us estimate your starting loads.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="weight">Weight for ~10 reps (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.5"
              placeholder="40"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={saveEstimate.isPending}
            >
              Skip (use default)
            </Button>
            <Button type="submit" disabled={saveEstimate.isPending}>
              {saveEstimate.isPending ? 'Saving...' : 'Save Estimate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TenRMEstimateModal;