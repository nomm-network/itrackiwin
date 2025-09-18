import React from 'react';
import { Badge } from '@/components/ui/badge';
// Utility function for duration formatting
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 
    ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    : `${seconds}s`;
};

interface WorkoutSet {
  id: string;
  set_index: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  distance?: number;
  rpe?: number;
  effort?: string;
  notes?: string;
  settings?: Record<string, any>;
  load_meta?: Record<string, any>;
}

interface WorkoutSetDisplayProps {
  set: WorkoutSet;
  exerciseLoadMode?: 'none' | 'bodyweight_plus_optional' | 'external_added' | 'external_assist' | 'machine_level';
  className?: string;
}

const WorkoutSetDisplay: React.FC<WorkoutSetDisplayProps> = ({
  set,
  exerciseLoadMode = 'none',
  className
}) => {
  const formatWeight = () => {
    const weight = set.weight_kg;
    
    if (weight === null || weight === undefined) {
      // For bodyweight exercises with no added weight
      if (exerciseLoadMode === 'bodyweight_plus_optional') {
        return 'BW';
      }
      return null;
    }
    
    if (weight > 0) {
      return `+${weight} kg`;
    } else if (weight < 0) {
      const assistType = set.load_meta?.assist_type;
      const assistText = assistType ? ` • ${assistType}` : '';
      return `${Math.abs(weight)} kg assist${assistText}`;
    } else if (weight === 0 && exerciseLoadMode === 'bodyweight_plus_optional') {
      return 'BW';
    }
    
    return null;
  };

  const formatEffortMetric = () => {
    switch (set.effort) {
      case 'reps':
        return set.reps ? `${set.reps} reps` : '';
      case 'time':
        return set.duration_seconds ? formatDuration(set.duration_seconds) : '';
      case 'distance':
        return set.distance ? `${set.distance}m` : '';
      case 'calories':
        const calories = set.settings?.calories;
        return calories ? `${calories} cal` : '';
      default:
        // Fallback to reps if no effort specified
        return set.reps ? `${set.reps} reps` : '';
    }
  };

  const getEquipmentSettings = () => {
    if (!set.settings || Object.keys(set.settings).length === 0) return [];
    
    const settings = [];
    
    // Treadmill settings
    if (set.settings.speed_kmh) {
      settings.push(`${set.settings.speed_kmh} km/h`);
    }
    if (set.settings.incline_pct) {
      settings.push(`${set.settings.incline_pct}% incline`);
    }
    
    // Bike settings
    if (set.settings.resistance_level) {
      settings.push(`L${set.settings.resistance_level}`);
    }
    if (set.settings.cadence_rpm) {
      settings.push(`${set.settings.cadence_rpm} rpm`);
    }
    
    // Rower settings
    if (set.settings.drag_factor) {
      settings.push(`DF${set.settings.drag_factor}`);
    }
    if (set.settings.stroke_rate) {
      settings.push(`${set.settings.stroke_rate} spm`);
    }
    
    return settings;
  };

  const weightDisplay = formatWeight();
  const effortDisplay = formatEffortMetric();
  const equipmentSettings = getEquipmentSettings();

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span className="font-medium">Set {set.set_index}:</span>
      
      {effortDisplay && (
        <span className="font-semibold text-primary">{effortDisplay}</span>
      )}
      
      {weightDisplay && (
        <Badge variant="secondary" className="text-xs">
          {weightDisplay}
        </Badge>
      )}
      
      {set.rpe && (
        <Badge variant="outline" className="text-xs">
          RPE {set.rpe}
        </Badge>
      )}
      
      {equipmentSettings.map((setting, index) => (
        <Badge key={index} variant="outline" className="text-xs">
          {setting}
        </Badge>
      ))}
      
      {set.notes && (
        <span className="text-muted-foreground italic text-xs">
          "{set.notes}"
        </span>
      )}
    </div>
  );
};

export default WorkoutSetDisplay;