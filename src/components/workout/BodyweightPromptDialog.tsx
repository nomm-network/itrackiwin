import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Scale, Plus } from 'lucide-react';
import { useUnifiedSetLogging } from '@/hooks/useUnifiedSetLogging';
import { toast } from 'sonner';

interface BodyweightPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWeightRecorded: (weight: number) => void;
  currentWeight?: number | null;
}

/**
 * Dialog to prompt user for their current bodyweight when logging bodyweight exercises
 * Stores the weight in the user_body_metrics table for historical tracking
 */
export const BodyweightPromptDialog: React.FC<BodyweightPromptDialogProps> = ({
  isOpen,
  onClose,
  onWeightRecorded,
  currentWeight
}) => {
  const { recordBodyweight } = useUnifiedSetLogging();
  const [weight, setWeight] = useState<string>(currentWeight?.toString() || '');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const weightValue = parseFloat(weight);
    if (!weightValue || weightValue <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    setIsLoading(true);
    try {
      await recordBodyweight(weightValue, notes || undefined);
      onWeightRecorded(weightValue);
      toast.success(`Bodyweight recorded: ${weightValue}kg`);
      onClose();
      setWeight('');
      setNotes('');
    } catch (error) {
      console.error('Error recording bodyweight:', error);
      toast.error('Failed to record bodyweight');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Record Your Current Weight
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Your bodyweight is needed to calculate the effective load for bodyweight exercises like pull-ups and dips.
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Current Weight (kg) *</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.1"
              min="20"
              max="300"
              placeholder="70.0"
              required
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., morning weight, after workout..."
              rows={2}
            />
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <strong>Privacy:</strong> Your weight data is stored securely and only used for calculating exercise loads.
            You can update it anytime from your profile.
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !weight} className="flex-1">
              {isLoading ? 'Recording...' : 'Record Weight'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Compact trigger button for quickly adding bodyweight
 */
export const BodyweightQuickAdd: React.FC<{
  onWeightRecorded: (weight: number) => void;
  currentWeight?: number | null;
}> = ({ onWeightRecorded, currentWeight }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="text-xs"
      >
        <Plus className="h-3 w-3 mr-1" />
        {currentWeight ? 'Update Weight' : 'Add Weight'}
      </Button>
      
      <BodyweightPromptDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onWeightRecorded={onWeightRecorded}
        currentWeight={currentWeight}
      />
    </>
  );
};