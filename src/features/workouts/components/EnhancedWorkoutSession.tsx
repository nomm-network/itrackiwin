import React, {useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import ExerciseBlock from './ExerciseBlock';
import SessionLogPanel from './SessionLogPanel';
import {useSessionTimer} from '../hooks/useSessionTimer';

type Exercise = {
  id: string;
  name: string;
  loadType: 'single_total' | 'dual_load' | 'stack';
  barType?: 'barbell' | 'ezbar';
  workingWeightKg?: number;
  targetReps?: number;
};

type WorkoutData = {
  id: string;
  title: string;
  exercises: Exercise[];
};

export default function EnhancedWorkoutSession() {
  const { id } = useParams();
  const [logLines, setLogLines] = useState<string[]>([]);
  const { elapsedLabel } = useSessionTimer();

  // TODO: replace with real fetch
  const workout: WorkoutData = useMemo(() => ({
    id: id || 'free',
    title: 'Free Session',
    exercises: [],
  }), [id]);

  const pushLog = (line: string) => setLogLines(prev => [...prev, line]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <h1 className="text-xl font-semibold">{workout.title}</h1>
        <div className="rounded-md bg-muted px-2 py-1 text-sm tabular-nums">{elapsedLabel}</div>
      </div>

      {/* Exercises */}
      <div className="space-y-8">
        {workout.exercises.map((ex, idx) => (
          <ExerciseBlock
            key={ex.id}
            index={idx + 1}
            exercise={ex}
            onDebug={pushLog}
          />
        ))}
      </div>

      {/* Debug / details */}
      <SessionLogPanel lines={logLines} />
    </div>
  );
}