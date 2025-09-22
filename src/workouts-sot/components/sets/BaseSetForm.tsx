import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnifiedSetLogging } from '@/hooks/useUnifiedSetLogging';
import { useToast } from '@/hooks/use-toast';

export interface Exercise {
  id: string;
  effort_mode: 'reps' | 'time' | 'distance' | 'calories';
  load_mode: 'none' | 'bodyweight_plus_optional' | 'external_added' | 'external_assist' | 'machine_level' | 'band_level' | 'free_weight';
  equipment?: {
    equipment_type?: string;
    slug?: string;
  };
}

export interface BaseSetFormProps {
  workoutExerciseId: string;
  exercise: Exercise;
  setIndex: number;
  onLogged: () => void;
  onCancel?: () => void;
  className?: string;
}

export interface BaseFormState {
  rpe: number | '';
  notes: string;
  restSeconds: number | '';
  assistType: 'band' | 'machine' | null;
  settings: Record<string, any>;
  loadMeta: Record<string, any>;
}

export const useBaseFormState = (): [BaseFormState, React.Dispatch<React.SetStateAction<BaseFormState>>] => {
  const [state, setState] = useState<BaseFormState>({
    rpe: '',
    notes: '',
    restSeconds: '',
    assistType: null,
    settings: {},
    loadMeta: {}
  });

  return [state, setState];
};

// Common form fields component
export const CommonFields: React.FC<{
  rpe: number | '';
  notes: string;
  restSeconds: number | '';
  onRpeChange: (value: number | '') => void;
  onNotesChange: (value: string) => void;
  onRestSecondsChange: (value: number | '') => void;
}> = ({ rpe, notes, restSeconds, onRpeChange, onNotesChange, onRestSecondsChange }) => (
  <>
    {/* RPE */}
    <div className="space-y-2">
      <Label htmlFor="rpe">RPE (Rate of Perceived Exertion)</Label>
      <Select 
        value={rpe?.toString() || ''} 
        onValueChange={(value) => onRpeChange(value === '' ? '' : Number(value))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select RPE" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
            <SelectItem key={num} value={num.toString()}>
              {num} - {getRpeDescription(num)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Rest Time */}
    <div className="space-y-2">
      <Label htmlFor="rest">Rest (seconds)</Label>
      <Input
        id="rest"
        type="number"
        value={restSeconds}
        onChange={(e) => onRestSecondsChange(e.target.value === '' ? '' : Number(e.target.value))}
        min={0}
        step={15}
        placeholder="0"
      />
    </div>

    {/* Notes */}
    <div className="space-y-2 col-span-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Any notes about this set..."
        rows={2}
      />
    </div>
  </>
);

// Assistance type selector
export const AssistanceSelector: React.FC<{
  assistType: 'band' | 'machine' | null;
  onAssistTypeChange: (type: 'band' | 'machine' | null) => void;
}> = ({ assistType, onAssistTypeChange }) => (
  <div className="space-y-2">
    <Label>Assistance Type</Label>
    <Select 
      value={assistType || ''} 
      onValueChange={(value) => onAssistTypeChange(value as 'band' | 'machine' || null)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select assistance type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="band">Resistance Band</SelectItem>
        <SelectItem value="machine">Assisted Machine</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

const getRpeDescription = (rpe: number): string => {
  const descriptions: Record<number, string> = {
    1: 'Very Light',
    2: 'Light', 
    3: 'Moderate',
    4: 'Somewhat Hard',
    5: 'Hard',
    6: 'Harder',
    7: 'Very Hard',
    8: 'Very Very Hard',
    9: 'Extremely Hard',
    10: 'Maximum'
  };
  return descriptions[rpe] || '';
};

export { useUnifiedSetLogging };

// Export a toast helper that uses the hook correctly
export const createToast = () => {
  const { toast } = useToast();
  return toast;
};