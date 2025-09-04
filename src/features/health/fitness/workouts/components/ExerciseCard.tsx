// src/features/health/fitness/workouts/components/ExerciseCard.tsx
import React, { useMemo, useState } from 'react';
import WarmupPanel from './WarmupPanel';
import PrevTargetTile from './PrevTargetTile';
import SetControls from './SetControls';
import { makeWarmupSteps } from '../hooks/useTargets';

export default function ExerciseCard(props: {
  exercise: any;            // workout_exercises row
  last?: {kg:number|null; reps:number|null; date?:string|null};
  target: {kg:number|null; reps:number|null};
  onLog: (payload:{weight_kg:number|null; reps:number|null; rpe:number|null; pain:'none'|'minor'|'hurt'})=>Promise<void>;
  setIndex: number;
  showWarmup: boolean;
}) {
  const [w, setW] = useState<number|null>(props.target.kg ?? null);
  const [r, setR] = useState<number|null>(props.target.reps ?? null);
  const [rpe, setRpe] = useState<number|null>(2);
  const [pain, setPain] = useState<'none'|'minor'|'hurt'>('none');

  const warmupSteps = useMemo(() => {
    const server = props.exercise?.attribute_values_json?.warmup;
    if (Array.isArray(server) && server.length) return server;
    if (props.target.kg) return makeWarmupSteps(props.target.kg);
    return [];
  }, [props.exercise, props.target.kg]);

  const displayName = props.exercise.exercises?.display_name || props.exercise.display_name || 'Exercise';

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 mb-8">
      {props.showWarmup && (
        <WarmupPanel 
          workoutExerciseId={props.exercise.id || ""} 
          topWeightKg={props.target.kg} 
          steps={warmupSteps} 
        />
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="text-xl font-semibold">{displayName}</div>
        <div className="opacity-70 text-sm">{props.setIndex - 1}/3 sets</div>
      </div>

      <PrevTargetTile prev={props.last} target={props.target} />

      <SetControls
        weight={w} reps={r} onChange={(nw,nr)=>{ setW(nw); setR(nr); }}
        rpe={rpe} onRpe={setRpe}
        pain={pain} onPain={setPain}
        setIndex={props.setIndex}
        onLog={async () => { await props.onLog({ weight_kg:w, reps:r, rpe, pain }); }}
      />
    </div>
  );
}