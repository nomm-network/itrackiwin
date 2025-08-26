import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HandleGripSelector } from '@/components/exercise/HandleGripSelector';

interface ExerciseGripDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (handleId: string | undefined, gripIds: string[], displayName: string) => void;
  exerciseName: string;
}

export default function ExerciseGripDialog({
  isOpen,
  onClose,
  onConfirm,
  exerciseName
}: ExerciseGripDialogProps) {
  const [selectedHandleId, setSelectedHandleId] = useState<string | undefined>();
  const [selectedGrips, setSelectedGrips] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');

  const handleConfirm = () => {
    onConfirm(selectedHandleId, selectedGrips, displayName || exerciseName);
    setSelectedHandleId(undefined);
    setSelectedGrips([]);
    setDisplayName('');
    onClose();
  };

  const handleCancel = () => {
    setSelectedHandleId(undefined);
    setSelectedGrips([]);
    setDisplayName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Exercise Variation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="exercise-name">Exercise: {exerciseName}</Label>
          </div>
          
          <div>
            <Label htmlFor="display-name">Display Name (Optional)</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={`${exerciseName} (rope pushdown)`}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Leave empty to auto-generate from exercise + handle + grip
            </p>
          </div>
          
          <div>
            <HandleGripSelector
              selectedHandleId={selectedHandleId}
              selectedGripIds={selectedGrips}
              onHandleChange={setSelectedHandleId}
              onGripChange={setSelectedGrips}
              multiSelect={true}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Add Exercise Variation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}