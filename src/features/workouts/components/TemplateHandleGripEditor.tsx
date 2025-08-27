import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HandleGripSelector } from './HandleGripSelector';
import { HandleGripBadges } from './HandleGripBadges';
import { useHandleSelector } from '@/features/workouts/hooks/useHandleSelector';
import { toast } from 'sonner';

interface TemplateHandleGripEditorProps {
  exerciseId: string;
  templateExerciseId: string;
  initialHandleId?: string;
  initialGripIds?: string[];
  onUpdate?: (handleId?: string, gripIds?: string[]) => void;
}

export function TemplateHandleGripEditor({
  exerciseId,
  templateExerciseId,
  initialHandleId,
  initialGripIds = [],
  onUpdate
}: TemplateHandleGripEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHandleId, setSelectedHandleId] = useState<string | undefined>(initialHandleId);
  const [selectedGripIds, setSelectedGripIds] = useState<string[]>(initialGripIds);
  const { saveTemplateSelection, isLoading } = useHandleSelector({ exerciseId });

  const handleSave = async () => {
    try {
      await saveTemplateSelection(templateExerciseId, selectedHandleId, selectedGripIds);
      onUpdate?.(selectedHandleId, selectedGripIds);
      setIsOpen(false);
      toast.success('Handle & grip selection saved');
    } catch (error) {
      toast.error('Failed to save selection');
      console.error('Save error:', error);
    }
  };

  const handleCancel = () => {
    // Reset to initial values
    setSelectedHandleId(initialHandleId);
    setSelectedGripIds(initialGripIds);
    setIsOpen(false);
  };

  const hasChanges = selectedHandleId !== initialHandleId || 
    JSON.stringify(selectedGripIds.sort()) !== JSON.stringify(initialGripIds.sort());

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="w-full">
          <HandleGripBadges
            selectedHandleId={initialHandleId}
            selectedGripIds={initialGripIds}
            showEdit
            onEditClick={() => setIsOpen(true)}
            compact
          />
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Handle & Grips</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <HandleGripSelector
            exerciseId={exerciseId}
            selectedHandleId={selectedHandleId}
            selectedGripIds={selectedGripIds}
            onHandleChange={setSelectedHandleId}
            onGripChange={setSelectedGripIds}
            multiSelectGrips
          />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}