import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GripSelector from '@/components/GripSelector';

interface ExerciseGripDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (gripIds: string[], displayName: string) => void;
  exerciseName: string;
}

export default function ExerciseGripDialog({
  isOpen,
  onClose,
  onConfirm,
  exerciseName
}: ExerciseGripDialogProps) {
  const [selectedGrips, setSelectedGrips] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');

  const handleConfirm = () => {
    onConfirm(selectedGrips, displayName || exerciseName);
    setSelectedGrips([]);
    setDisplayName('');
    onClose();
  };

  const handleCancel = () => {
    setSelectedGrips([]);
    setDisplayName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Exercise Variation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="exercise-name">Exercise: {exerciseName}</Label>
          </div>
          
          <div>
            <Label htmlFor="display-name">Display Name (Optional)</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={`${exerciseName} (wide grip)`}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Leave empty to use exercise name
            </p>
          </div>
          
          <div>
            <Label>Select Grips</Label>
            <div className="mt-2">
            <GripSelector
              selectedGrips={selectedGrips}
              onGripsChange={setSelectedGrips}
            />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Choose specific grips for this exercise instance
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Add Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}