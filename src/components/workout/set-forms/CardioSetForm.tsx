import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Zap, Timer } from 'lucide-react';
import { 
  BaseSetFormProps, 
  CommonFields,
  useBaseFormState,
  useUnifiedSetLogging,
  toast 
} from './BaseSetForm';

interface CardioSetFormProps extends BaseSetFormProps {}

const CardioSetForm: React.FC<CardioSetFormProps> = ({
  workoutExerciseId,
  exercise,
  setIndex,
  onLogged,
  onCancel,
  className
}) => {
  const { logSet, isLoading } = useUnifiedSetLogging();
  const [baseState, setBaseState] = useBaseFormState();
  
  // Cardio-specific fields
  const [durationSeconds, setDurationSeconds] = useState<number | ''>('');
  const [distance, setDistance] = useState<number | ''>('');
  const [calories, setCalories] = useState<number | ''>('');
  const [equipment, setEquipment] = useState<Record<string, any>>({});
  
  const { rpe, notes, restSeconds, settings } = baseState;
  const effortMode = exercise.effort_mode;
  const equipmentSlug = exercise.equipment?.slug;

  // Initialize equipment-specific settings
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
      initSettings.stroke_rate = '';
    } else if (equipmentSlug?.includes('elliptical')) {
      initSettings.resistance_level = '';
      initSettings.incline_pct = '';
    }
    
    setEquipment(initSettings);
  }, [equipmentSlug]);

  const handleEquipmentChange = (key: string, value: string) => {
    setEquipment(prev => ({
      ...prev,
      [key]: value === '' ? undefined : parseFloat(value) || value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation based on effort mode
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

    try {
      const metrics: any = {
        notes: notes || undefined,
        rpe: rpe ? Number(rpe) : undefined,
        effort: effortMode,
        load_mode: exercise.load_mode
      };

      // Add effort-specific metrics
      if (effortMode === 'time') {
        metrics.duration_seconds = Number(durationSeconds);
      } else if (effortMode === 'distance') {
        metrics.distance_meters = Number(distance);
        if (durationSeconds) metrics.duration_seconds = Number(durationSeconds);
      } else if (effortMode === 'calories') {
        metrics.calories = Number(calories);
        if (durationSeconds) metrics.duration_seconds = Number(durationSeconds);
      }

      // Add equipment settings if any
      if (Object.keys(equipment).length > 0) {
        metrics.settings = equipment;
      }

      await logSet({
        workoutExerciseId,
        setIndex,
        metrics
      });
      
      const performanceDisplay = getPerformanceDisplay();
      toast({
        title: "Set Logged Successfully",
        description: `Set ${setIndex + 1}: ${performanceDisplay}`,
      });

      // Reset form
      setDurationSeconds('');
      setDistance('');
      setCalories('');
      setEquipment({});
      setBaseState(prev => ({ ...prev, rpe: '', notes: '' }));
      
      onLogged();
    } catch (error) {
      console.error('Error logging set:', error);
      toast({
        title: "Error",
        description: "Failed to log set. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getPerformanceDisplay = (): string => {
    if (effortMode === 'time') {
      const mins = Math.floor(Number(durationSeconds) / 60);
      const secs = Number(durationSeconds) % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    if (effortMode === 'distance') return `${distance}m`;
    if (effortMode === 'calories') return `${calories} cal`;
    return 'Cardio session';
  };

  const getEquipmentIcon = () => {
    if (equipmentSlug?.includes('treadmill')) return <Timer className="h-4 w-4" />;
    if (equipmentSlug?.includes('bike')) return <Zap className="h-4 w-4" />;
    if (equipmentSlug?.includes('rower')) return <MapPin className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Exercise Type Badge */}
      <div className="flex items-center gap-2">
        {getEquipmentIcon()}
        <Badge variant="secondary">Cardio</Badge>
        <Badge variant="outline" className="capitalize">{effortMode}</Badge>
      </div>

      {/* Primary Metrics Based on Effort Mode */}
      <div className="grid grid-cols-2 gap-4">
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
              placeholder="300"
              required
            />
            {durationSeconds !== '' && (
              <p className="text-xs text-muted-foreground">
                {formatDuration(Number(durationSeconds))}
              </p>
            )}
          </div>
        )}

        {effortMode === 'distance' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (meters) *</Label>
              <Input
                id="distance"
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                step={10}
                placeholder="1000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                step={1}
                placeholder="300"
              />
            </div>
          </>
        )}

        {effortMode === 'calories' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="calories">Calories Burned *</Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                step={1}
                placeholder="150"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                step={1}
                placeholder="300"
              />
            </div>
          </>
        )}
      </div>

      {/* Equipment-Specific Settings */}
      {equipmentSlug?.includes('treadmill') && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="speed">Speed (km/h)</Label>
            <Input
              id="speed"
              type="number"
              value={equipment.speed_kmh || ''}
              onChange={(e) => handleEquipmentChange('speed_kmh', e.target.value)}
              min={0}
              step={0.1}
              placeholder="10.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="incline">Incline (%)</Label>
            <Input
              id="incline"
              type="number"
              value={equipment.incline_pct || ''}
              onChange={(e) => handleEquipmentChange('incline_pct', e.target.value)}
              min={0}
              step={0.5}
              placeholder="2.0"
            />
          </div>
        </div>
      )}

      {(equipmentSlug?.includes('bike') || equipmentSlug?.includes('cycle')) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="resistance">Resistance Level</Label>
            <Input
              id="resistance"
              type="number"
              value={equipment.resistance_level || ''}
              onChange={(e) => handleEquipmentChange('resistance_level', e.target.value)}
              min={0}
              step={1}
              placeholder="8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cadence">Cadence (RPM)</Label>
            <Input
              id="cadence"
              type="number"
              value={equipment.cadence_rpm || ''}
              onChange={(e) => handleEquipmentChange('cadence_rpm', e.target.value)}
              min={0}
              step={1}
              placeholder="90"
            />
          </div>
        </div>
      )}

      {equipmentSlug?.includes('rower') && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="drag">Drag Factor</Label>
            <Input
              id="drag"
              type="number"
              value={equipment.drag_factor || ''}
              onChange={(e) => handleEquipmentChange('drag_factor', e.target.value)}
              min={0}
              step={1}
              placeholder="110"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stroke">Stroke Rate</Label>
            <Input
              id="stroke"
              type="number"
              value={equipment.stroke_rate || ''}
              onChange={(e) => handleEquipmentChange('stroke_rate', e.target.value)}
              min={0}
              step={1}
              placeholder="28"
            />
          </div>
        </div>
      )}

      {/* Performance Summary */}
      <div className="text-sm bg-muted p-3 rounded-md">
        <div className="font-medium">Performance: {getPerformanceDisplay()}</div>
        {distance !== '' && durationSeconds !== '' && (
          <div className="text-xs text-muted-foreground mt-1">
            Average Pace: {((Number(durationSeconds) / 60) / (Number(distance) / 1000)).toFixed(2)} min/km
          </div>
        )}
      </div>

      {/* Common Fields */}
      <div className="grid grid-cols-2 gap-4">
        <CommonFields
          rpe={rpe}
          notes={notes}
          restSeconds={restSeconds}
          onRpeChange={(value) => setBaseState(prev => ({ ...prev, rpe: value }))}
          onNotesChange={(value) => setBaseState(prev => ({ ...prev, notes: value }))}
          onRestSecondsChange={(value) => setBaseState(prev => ({ ...prev, restSeconds: value }))}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading || 
            (effortMode === 'time' && !durationSeconds) ||
            (effortMode === 'distance' && !distance) ||
            (effortMode === 'calories' && !calories)
          } 
          className="flex-1"
        >
          {isLoading ? 'Logging...' : `Log Set ${setIndex + 1}`}
        </Button>
      </div>
    </form>
  );
};

export default CardioSetForm;