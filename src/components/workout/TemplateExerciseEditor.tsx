import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  effort_mode: 'reps' | 'time' | 'distance' | 'calories';
  load_mode: 'none' | 'bodyweight_plus_optional' | 'external_added' | 'external_assist' | 'machine_level';
}

interface TemplateExercise {
  id?: string;
  exercise_id?: string;
  candidate_id?: string;
  order_index: number;
  default_sets: number;
  target_reps?: number;
  rep_range_min?: number;
  rep_range_max?: number;
  target_weight_kg?: number;
  weight_unit: string;
  target_settings?: Record<string, any>;
  attribute_values_json: Record<string, any>;
  notes?: string;
}

interface TemplateExerciseEditorProps {
  templateExercise?: TemplateExercise;
  exercise?: Exercise;
  onSave: (data: TemplateExercise) => void;
  onCancel?: () => void;
  className?: string;
}

const TemplateExerciseEditor: React.FC<TemplateExerciseEditorProps> = ({
  templateExercise,
  exercise,
  onSave,
  onCancel,
  className
}) => {
  const [formData, setFormData] = useState<TemplateExercise>({
    order_index: 1,
    default_sets: 3,
    weight_unit: 'kg',
    attribute_values_json: {},
    ...templateExercise
  });

  const [targetType, setTargetType] = useState<'reps' | 'rep_range' | 'settings'>('reps');

  useEffect(() => {
    // Determine target type based on existing data
    if (formData.target_settings && Object.keys(formData.target_settings).length > 0) {
      setTargetType('settings');
    } else if (formData.rep_range_min && formData.rep_range_max) {
      setTargetType('rep_range');
    } else {
      setTargetType('reps');
    }
  }, [formData.target_settings, formData.rep_range_min, formData.rep_range_max]);

  const handleSave = () => {
    // Validation: Ensure required fields are present
    if (!formData.default_sets || formData.default_sets < 1) {
      toast({
        title: "Validation Error",
        description: "Default sets must be at least 1.",
        variant: "destructive"
      });
      return;
    }

    // Validation: Ensure one target method is specified
    const hasTargetReps = formData.target_reps && formData.target_reps > 0;
    const hasRepRange = formData.rep_range_min && formData.rep_range_max && 
                       formData.rep_range_min > 0 && formData.rep_range_max >= formData.rep_range_min;
    const hasTargetSettings = formData.target_settings && Object.keys(formData.target_settings).length > 0;

    if (!hasTargetReps && !hasRepRange && !hasTargetSettings) {
      toast({
        title: "Validation Error",
        description: "Must specify either target reps, rep range, or target settings (duration/distance).",
        variant: "destructive"
      });
      return;
    }

    // Clean up unused target fields based on selected type
    const cleanedData = { ...formData };
    
    if (targetType === 'reps') {
      cleanedData.rep_range_min = undefined;
      cleanedData.rep_range_max = undefined;
      cleanedData.target_settings = undefined;
    } else if (targetType === 'rep_range') {
      cleanedData.target_reps = undefined;
      cleanedData.target_settings = undefined;
    } else if (targetType === 'settings') {
      cleanedData.target_reps = undefined;
      cleanedData.rep_range_min = undefined;
      cleanedData.rep_range_max = undefined;
    }

    // Ensure required JSON fields are objects
    cleanedData.attribute_values_json = cleanedData.attribute_values_json || {};
    
    onSave(cleanedData);
  };

  const updateFormData = (field: keyof TemplateExercise, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateTargetSettings = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      target_settings: {
        ...prev.target_settings,
        [key]: value === '' ? undefined : value
      }
    }));
  };

  const isUnmappedExercise = !!formData.candidate_id && !formData.exercise_id;

  return (
    <div className={`space-y-4 p-4 border rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {exercise?.name || 'Template Exercise'}
        </h3>
        {isUnmappedExercise && (
          <Badge variant="outline" className="text-yellow-600 border-yellow-400">
            New Exercise
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="default_sets">Default Sets *</Label>
          <Input
            id="default_sets"
            type="number"
            value={formData.default_sets}
            onChange={(e) => updateFormData('default_sets', Number(e.target.value))}
            min={1}
            max={10}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order_index">Order</Label>
          <Input
            id="order_index"
            type="number"
            value={formData.order_index}
            onChange={(e) => updateFormData('order_index', Number(e.target.value))}
            min={1}
          />
        </div>
      </div>

      {/* Target Type Selector */}
      <div className="space-y-2">
        <Label>Target Method *</Label>
        <Select value={targetType} onValueChange={(value: 'reps' | 'rep_range' | 'settings') => setTargetType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reps">Fixed Reps</SelectItem>
            <SelectItem value="rep_range">Rep Range</SelectItem>
            {exercise?.effort_mode === 'time' && (
              <SelectItem value="settings">Duration Target</SelectItem>
            )}
            {exercise?.effort_mode === 'distance' && (
              <SelectItem value="settings">Distance Target</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Target Inputs based on type */}
      {targetType === 'reps' && (
        <div className="space-y-2">
          <Label htmlFor="target_reps">Target Reps</Label>
          <Input
            id="target_reps"
            type="number"
            value={formData.target_reps || ''}
            onChange={(e) => updateFormData('target_reps', e.target.value ? Number(e.target.value) : undefined)}
            min={1}
            placeholder="8"
          />
        </div>
      )}

      {targetType === 'rep_range' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rep_range_min">Min Reps</Label>
            <Input
              id="rep_range_min"
              type="number"
              value={formData.rep_range_min || ''}
              onChange={(e) => updateFormData('rep_range_min', e.target.value ? Number(e.target.value) : undefined)}
              min={1}
              placeholder="6"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rep_range_max">Max Reps</Label>
            <Input
              id="rep_range_max"
              type="number"
              value={formData.rep_range_max || ''}
              onChange={(e) => updateFormData('rep_range_max', e.target.value ? Number(e.target.value) : undefined)}
              min={1}
              placeholder="10"
            />
          </div>
        </div>
      )}

      {targetType === 'settings' && exercise?.effort_mode === 'time' && (
        <div className="space-y-2">
          <Label htmlFor="target_duration">Target Duration (seconds)</Label>
          <Input
            id="target_duration"
            type="number"
            value={formData.target_settings?.duration_seconds || ''}
            onChange={(e) => updateTargetSettings('duration_seconds', e.target.value ? Number(e.target.value) : undefined)}
            min={1}
            placeholder="60"
          />
        </div>
      )}

      {targetType === 'settings' && exercise?.effort_mode === 'distance' && (
        <div className="space-y-2">
          <Label htmlFor="target_distance">Target Distance (meters)</Label>
          <Input
            id="target_distance"
            type="number"
            value={formData.target_settings?.distance || ''}
            onChange={(e) => updateTargetSettings('distance', e.target.value ? Number(e.target.value) : undefined)}
            min={1}
            step={0.1}
            placeholder="1000"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="target_weight_kg">Target Weight (kg)</Label>
        <Input
          id="target_weight_kg"
          type="number"
          value={formData.target_weight_kg || ''}
          onChange={(e) => updateFormData('target_weight_kg', e.target.value ? Number(e.target.value) : undefined)}
          step={2.5}
          placeholder="Optional"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => updateFormData('notes', e.target.value || undefined)}
          placeholder="Any specific instructions or notes..."
          rows={2}
        />
      </div>

      {isUnmappedExercise && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a new exercise. Advanced options like grips will be available once the exercise is approved and mapped.
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} className="flex-1">
          Save Exercise
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default TemplateExerciseEditor;