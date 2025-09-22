import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import EffortModeSetForm from './EffortModeSetForm';

const SetLoggingDemo = () => {
  const [selectedExercise, setSelectedExercise] = useState<string>('barbell-squat');

  // Example exercises demonstrating different effort_mode and load_mode combinations
  const exampleExercises = {
    'barbell-squat': {
      id: 'ex-1',
      name: 'Barbell Squat',
      effort_mode: 'reps' as const,
      load_mode: 'external_added' as const,
      equipment: { equipment_type: 'barbell', slug: 'barbell' }
    },
    'dips': {
      id: 'ex-2', 
      name: 'Dips',
      effort_mode: 'reps' as const,
      load_mode: 'bodyweight_plus_optional' as const,
      equipment: { equipment_type: 'bodyweight', slug: 'dip-station' }
    },
    'assisted-pullup': {
      id: 'ex-3',
      name: 'Assisted Pull-up', 
      effort_mode: 'reps' as const,
      load_mode: 'external_assist' as const,
      equipment: { equipment_type: 'machine', slug: 'assisted-pullup-machine' }
    },
    'treadmill-run': {
      id: 'ex-4',
      name: 'Treadmill Run',
      effort_mode: 'time' as const,
      load_mode: 'none' as const,
      equipment: { equipment_type: 'cardio', slug: 'treadmill' }
    },
    'rowing-distance': {
      id: 'ex-5',
      name: 'Rowing Machine',
      effort_mode: 'distance' as const,
      load_mode: 'none' as const,
      equipment: { equipment_type: 'cardio', slug: 'rowing-machine' }
    },
    'stationary-bike': {
      id: 'ex-6',
      name: 'Stationary Bike',
      effort_mode: 'time' as const,
      load_mode: 'none' as const,
      equipment: { equipment_type: 'cardio', slug: 'stationary-bike' }
    }
  };

  const currentExercise = exampleExercises[selectedExercise as keyof typeof exampleExercises];

  const handleSetLogged = () => {
    console.log('Set logged successfully!');
  };

  const getLoadModeDescription = (loadMode: string) => {
    switch (loadMode) {
      case 'none': return 'No load tracking';
      case 'bodyweight_plus_optional': return 'Bodyweight + optional weight';
      case 'external_added': return 'External weight added';
      case 'external_assist': return 'Assistance provided';
      case 'machine_level': return 'Machine resistance level';
      case 'band_level': return 'Band resistance level';
      default: return loadMode;
    }
  };

  const getEffortModeDescription = (effortMode: string) => {
    switch (effortMode) {
      case 'reps': return 'Repetition-based';
      case 'time': return 'Time-based duration';
      case 'distance': return 'Distance-based';
      case 'calories': return 'Calorie-based';
      default: return effortMode;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adaptive Set Logging Form</CardTitle>
          <CardDescription>
            Form adapts based on exercise effort_mode and load_mode for proper data collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Exercise Type</label>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(exampleExercises).map(([key, exercise]) => (
                  <SelectItem key={key} value={key}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline">
              Effort: {getEffortModeDescription(currentExercise.effort_mode)}
            </Badge>
            <Badge variant="outline">
              Load: {getLoadModeDescription(currentExercise.load_mode)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{currentExercise.name} - Set Logging</CardTitle>
          <CardDescription>
            Form fields adapt based on the exercise configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EffortModeSetForm
            workoutExerciseId="demo-workout-exercise-id"
            exercise={currentExercise}
            setIndex={1}
            onLogged={handleSetLogged}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Storage Conventions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>Weight Storage (weight_kg):</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Positive: Added weight (weighted dips: +20kg)</li>
              <li>Negative: Assistance (assisted pull-ups: -15kg)</li>
              <li>Zero/Null: Bodyweight only</li>
            </ul>
          </div>
          
          <div>
            <strong>Equipment Settings (settings jsonb):</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Treadmill: {`{"speed_kmh": 10.5, "incline_pct": 2}`}</li>
              <li>Bike: {`{"resistance_level": 8, "cadence_rpm": 90}`}</li>
              <li>Rower: {`{"drag_factor": 110}`}</li>
            </ul>
          </div>

          <div>
            <strong>Load Metadata (load_meta jsonb):</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Assisted exercises: {`{"assist_type": "band"}`}</li>
              <li>Machine exercises: {`{"assist_type": "machine"}`}</li>
            </ul>
          </div>

          <div>
            <strong>Effort-Specific Fields:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Reps mode: Uses reps + optional weight_kg</li>
              <li>Time mode: Uses duration_seconds</li>
              <li>Distance mode: Uses distance</li>
              <li>All modes: Support notes, rpe, rest_seconds</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetLoggingDemo;