import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PreCheckinInput, usePreCheckin } from '../hooks/usePreCheckin';

interface PreWorkoutDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: PreCheckinInput) => Promise<void>;
}

export function PreWorkoutDialog({ open, onClose, onSubmit }: PreWorkoutDialogProps) {
  const [formData, setFormData] = useState<PreCheckinInput>({
    energy: 3,
    sleep_quality: 3,
    sleep_hours: 7,
    muscle_soreness: 2,
    stress_level: 2,
    sick: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit pre-checkin:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pre-Workout Check-in</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Energy Level: {formData.energy}/5</Label>
            <Slider
              value={[formData.energy]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, energy: value }))}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Sleep Quality: {formData.sleep_quality}/5</Label>
            <Slider
              value={[formData.sleep_quality]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, sleep_quality: value }))}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Sleep Hours: {formData.sleep_hours}h</Label>
            <Slider
              value={[formData.sleep_hours]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, sleep_hours: value }))}
              min={4}
              max={12}
              step={0.5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Muscle Soreness: {formData.muscle_soreness}/5</Label>
            <Slider
              value={[formData.muscle_soreness]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, muscle_soreness: value }))}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Stress Level: {formData.stress_level}/5</Label>
            <Slider
              value={[formData.stress_level]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, stress_level: value }))}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="sick"
              checked={formData.sick}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sick: checked }))}
            />
            <Label htmlFor="sick">Feeling sick or unwell</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Starting...' : 'Start Workout'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}