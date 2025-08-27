import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { HandleGripSelector } from '@/components/exercise/HandleGripSelector';

interface ExerciseConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  exercise: any;
}

export default function ExerciseConfigDialog({
  isOpen,
  onClose,
  onSave,
  exercise
}: ExerciseConfigDialogProps) {
  const [config, setConfig] = useState({
    default_sets: exercise?.default_sets || 3,
    target_reps: exercise?.target_reps || '',
    target_weight: exercise?.target_weight || '',
    weight_unit: exercise?.weight_unit || 'kg',
    notes: exercise?.notes || '',
    display_name: exercise?.display_name || '',
    grip_ids: exercise?.grip_ids || []
  });

  const [selectedHandleId, setSelectedHandleId] = useState<string | undefined>();
  const [selectedGrips, setSelectedGrips] = useState<string[]>(exercise?.grip_ids || []);

  const handleSave = () => {
    onSave({
      ...config,
      grip_ids: selectedGrips
    });
    onClose();
  };

  const handleCancel = () => {
    // Reset to original values
    setConfig({
      default_sets: exercise?.default_sets || 3,
      target_reps: exercise?.target_reps || '',
      target_weight: exercise?.target_weight || '',
      weight_unit: exercise?.weight_unit || 'kg',
      notes: exercise?.notes || '',
      display_name: exercise?.display_name || '',
      grip_ids: exercise?.grip_ids || []
    });
    setSelectedGrips(exercise?.grip_ids || []);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Exercise</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={config.display_name}
              onChange={(e) => setConfig({ ...config, display_name: e.target.value })}
              placeholder="Custom name for this exercise"
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                value={config.default_sets}
                onChange={(e) => setConfig({ ...config, default_sets: parseInt(e.target.value) || 0 })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="target-reps">Target Reps</Label>
              <Input
                id="target-reps"
                type="number"
                value={config.target_reps}
                onChange={(e) => setConfig({ ...config, target_reps: parseInt(e.target.value) || undefined })}
                placeholder="Optional"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target-weight">Target Weight</Label>
              <Input
                id="target-weight"
                type="number"
                value={config.target_weight}
                onChange={(e) => setConfig({ ...config, target_weight: parseFloat(e.target.value) || undefined })}
                placeholder="Optional"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="weight-unit">Weight Unit</Label>
              <Select 
                value={config.weight_unit} 
                onValueChange={(value) => setConfig({ ...config, weight_unit: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={config.notes}
              onChange={(e) => setConfig({ ...config, notes: e.target.value })}
              placeholder="Exercise notes..."
              className="w-full mt-2 p-2 border rounded resize-none"
              rows={3}
            />
          </div>

          <div>
            <Label>Grips & Handles</Label>
            <div className="mt-2">
              <HandleGripSelector
                selectedHandleId={selectedHandleId}
                selectedGripIds={selectedGrips}
                onHandleChange={setSelectedHandleId}
                onGripChange={setSelectedGrips}
                multiSelect={true}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}