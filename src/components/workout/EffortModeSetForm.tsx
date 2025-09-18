import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnifiedSetLogging } from '@/hooks/useUnifiedSetLogging';
import { toast } from '@/hooks/use-toast';
import { Clock, MapPin, Zap, Weight, Plus, Minus } from 'lucide-react';

interface Exercise {
  id: string;
  effort_mode: 'reps' | 'time' | 'distance' | 'calories';
  load_mode: 'none' | 'bodyweight_plus_optional' | 'external_added' | 'external_assist' | 'machine_level' | 'band_level';
  equipment?: {
    equipment_type?: string;
    slug?: string;
  };
}

interface EffortModeSetFormProps {
  workoutExerciseId: string;
  exercise: Exercise;
  setIndex: number;
  onLogged: () => void;
  onCancel?: () => void;
  className?: string;
}

const EffortModeSetForm: React.FC<EffortModeSetFormProps> = ({
  workoutExerciseId,
  exercise,
  setIndex,
  onLogged,
  onCancel,
  className
}) => {
  const { logSet, isLoading } = useUnifiedSetLogging();
  
  // Common fields for all effort modes
  const [rpe, setRpe] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [restSeconds, setRestSeconds] = useState<number | ''>('');
  
  // Effort-specific fields
  const [reps, setReps] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [durationSeconds, setDurationSeconds] = useState<number | ''>('');
  const [distance, setDistance] = useState<number | ''>('');
  const [calories, setCalories] = useState<number | ''>('');
  
  // Machine/equipment settings
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loadMeta, setLoadMeta] = useState<Record<string, any>>({});
  
  // For bodyweight exercises with assistance/added weight
  const [assistType, setAssistType] = useState<'band' | 'machine' | null>(null);

  const effortMode = exercise.effort_mode;
  const loadMode = exercise.load_mode;
  const equipmentType = exercise.equipment?.equipment_type;
  const equipmentSlug = exercise.equipment?.slug;

  // Initialize settings based on equipment type
  useEffect(() => {
    const initSettings: Record<string, any> = {};
    
    if (equipmentSlug?.includes('treadmill')) {
      initSettings.speed_kmh = '';
      initSettings.incline_pct = '';
    } else if (equipmentSlug?.includes('bike') || equipmentSlug?.includes('cycle')) {
      initSettings.resistance_level = '';
      initSettings.cadence_rpm = '';
    } else if (equipmentSlug?.includes('rower') || equipmentSlug?.includes('rowing')) {
      initSettings.drag_factor = '';
    }
    
    setSettings(initSettings);
  }, [equipmentSlug]);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value === '' ? undefined : parseFloat(value) || value
    }));
  };

  const handleAssistTypeChange = (type: 'band' | 'machine' | null) => {
    setAssistType(type);
    setLoadMeta(prev => ({
      ...prev,
      assist_type: type
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation based on effort mode
    if (effortMode === 'reps' && !reps) {
      toast({
        title: "Reps Required",
        description: "Please enter the number of reps for this set.",
        variant: "destructive"
      });
      return;
    }

    if (effortMode === 'time' && !durationSeconds) {
      toast({
        title: "Duration Required", 
        description: "Please enter the duration for this set.",
        variant: "destructive"
      });
      return;
    }

    if (effortMode === 'distance' && !distance) {
      toast({
        title: "Distance Required",
        description: "Please enter the distance for this set.",
        variant: "destructive"
      });
      return;
    }

    if (effortMode === 'calories' && !calories) {
      toast({
        title: "Calories Required",
        description: "Please enter the calories burned for this set.",
        variant: "destructive"
      });
      return;
    }

    // Validation for load modes
    if (loadMode === 'external_added' && weight !== '' && Number(weight) < 0) {
      toast({
        title: "Invalid Weight",
        description: "External added load cannot be negative.",
        variant: "destructive"
      });
      return;
    }

    if (loadMode === 'external_assist' && weight !== '' && Number(weight) > 0) {
      toast({
        title: "Invalid Weight", 
        description: "Assisted exercises should use negative values for assistance.",
        variant: "destructive"
      });
      return;
    }

    try {
      const metrics: any = {
        notes: notes || undefined,
        rpe: rpe ? Number(rpe) : undefined,
        effort: effortMode, // Set the effort enum to match UI choice
        load_mode: loadMode, // Pass load_mode for validation
      };

      // Add effort-specific metrics
      if (effortMode === 'reps') {
        metrics.reps = Number(reps);
        
        // Handle weight based on load mode
        if (loadMode !== 'none' && weight !== '') {
          let finalWeight = Number(weight);
          
          // For assisted exercises, weight should be negative
          if (loadMode === 'external_assist' && assistType && finalWeight > 0) {
            finalWeight = -finalWeight;
          }
          
          metrics.weight = finalWeight;
          metrics.weight_unit = 'kg';
        }
      } else if (effortMode === 'time') {
        metrics.duration_seconds = Number(durationSeconds);
      } else if (effortMode === 'distance') {
        metrics.distance = Number(distance);
      } else if (effortMode === 'calories') {
        // Store calories in settings since there's no dedicated column
        metrics.settings = { calories: Number(calories) };
      }

      // Add equipment-specific settings if any are filled
      if (effortMode !== 'calories') { // Don't overwrite calories settings
        const filledSettings = Object.entries(settings).reduce((acc, [key, value]) => {
          if (value !== '' && value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);

        if (Object.keys(filledSettings).length > 0) {
          metrics.settings = filledSettings;
        }
      }

      // Ensure load_meta is always an object (NOT NULL constraint)
      const finalLoadMeta = Object.keys(loadMeta).length > 0 ? loadMeta : {};
      metrics.load_meta = finalLoadMeta;

      // Add rest seconds if provided
      if (restSeconds) {
        metrics.rest_seconds = Number(restSeconds);
      }

      await logSet({
        workoutExerciseId,
        setIndex,
        metrics
      });

      // Create success message based on effort mode
      let successMessage = `Set ${setIndex} logged`;
      if (effortMode === 'reps' && reps) {
        const weightPart = weight ? ` at ${weight}kg` : '';
        successMessage += `: ${reps} reps${weightPart}`;
      } else if (effortMode === 'time' && durationSeconds) {
        successMessage += `: ${Math.floor(Number(durationSeconds) / 60)}:${(Number(durationSeconds) % 60).toString().padStart(2, '0')}`;
      } else if (effortMode === 'distance' && distance) {
        successMessage += `: ${distance}m`;
      } else if (effortMode === 'calories' && calories) {
        successMessage += `: ${calories} calories`;
      }

      toast({
        title: "Set Logged Successfully",
        description: successMessage,
      });

      // Reset form
      setReps('');
      setWeight('');
      setDurationSeconds('');
      setDistance('');
      setCalories('');
      setRpe('');
      setNotes('');
      setRestSeconds('');
      setSettings(prev => Object.keys(prev).reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {} as Record<string, any>));

      onLogged();
    } catch (error) {
      console.error('Error logging set:', error);
      toast({
        title: "Failed to Log Set",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const getEffortIcon = () => {
    switch (effortMode) {
      case 'reps': return <Weight className="w-4 h-4" />;
      case 'time': return <Clock className="w-4 h-4" />;
      case 'distance': return <MapPin className="w-4 h-4" />;
      case 'calories': return <Zap className="w-4 h-4" />;
      default: return <Weight className="w-4 h-4" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 rounded-lg border border-border bg-card p-4 ${className}`}>
      {/* Header with effort mode indicator */}
      <div className="flex items-center gap-2 mb-4">
        {getEffortIcon()}
        <span className="text-sm font-medium capitalize">
          {effortMode} Exercise - Set {setIndex}
        </span>
      </div>

      {/* Effort-specific inputs */}
      <div className="grid grid-cols-2 gap-4">
        {effortMode === 'reps' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="reps">Reps *</Label>
              <Input
                id="reps"
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                step={1}
                placeholder="0"
                required
              />
            </div>
            
            {loadMode !== 'none' && (
              <div className="space-y-2">
                <Label htmlFor="weight">
                  Weight (kg)
                  {loadMode === 'external_assist' && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (+ for added, - for assist)
                    </span>
                  )}
                </Label>
                <div className="flex gap-2">
                  {loadMode === 'bodyweight_plus_optional' && (
                    <div className="flex">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setWeight(prev => Number(prev) - 2.5)}
                        className="px-2"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setWeight(prev => Number(prev) + 2.5)}
                        className="px-2"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    step={2.5}
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {effortMode === 'time' && (
          <div className="space-y-2 col-span-2">
            <Label htmlFor="duration">Duration (seconds) *</Label>
            <Input
              id="duration"
              type="number"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value === '' ? '' : Number(e.target.value))}
              min={0}
              step={1}
              placeholder="0"
              required
            />
          </div>
        )}

        {effortMode === 'distance' && (
          <div className="space-y-2 col-span-2">
            <Label htmlFor="distance">Distance (meters) *</Label>
            <Input
              id="distance"
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value === '' ? '' : Number(e.target.value))}
              min={0}
              step={0.1}
              placeholder="0"
              required
            />
          </div>
        )}

        {effortMode === 'calories' && (
          <div className="space-y-2 col-span-2">
            <Label htmlFor="calories">Calories Burned *</Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
              min={0}
              step={1}
              placeholder="0"
              required
            />
          </div>
        )}
      </div>

      {/* Assistance type selector for assisted exercises */}
      {loadMode === 'external_assist' && (
        <div className="space-y-2">
          <Label>Assistance Type</Label>
          <Select value={assistType || ''} onValueChange={(value) => handleAssistTypeChange(value as 'band' | 'machine')}>
            <SelectTrigger>
              <SelectValue placeholder="Select assistance type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="band">Resistance Band</SelectItem>
              <SelectItem value="machine">Assisted Machine</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Equipment-specific settings */}
      {Object.keys(settings).length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Equipment Settings</Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(settings).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={key} className="text-xs">
                  {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Label>
                <Input
                  id={key}
                  type="number"
                  value={value || ''}
                  onChange={(e) => handleSettingChange(key, e.target.value)}
                  placeholder="0"
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rpe">RPE (1-10)</Label>
          <Input
            id="rpe"
            type="number"
            value={rpe}
            onChange={(e) => setRpe(e.target.value === '' ? '' : Number(e.target.value))}
            min={1}
            max={10}
            step={0.5}
            placeholder="7"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rest">Rest (seconds)</Label>
          <Input
            id="rest"
            type="number"
            value={restSeconds}
            onChange={(e) => setRestSeconds(e.target.value === '' ? '' : Number(e.target.value))}
            min={0}
            step={15}
            placeholder="120"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes about this set..."
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Logging Set...' : `Log Set ${setIndex}`}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default EffortModeSetForm;