import React, { useState } from 'react';
import { Hand, Hash, Flame } from 'lucide-react';
import type { WorkoutExercise } from '../api/useWorkout';
import WarmupPanel from './WarmupPanel';
import { WorkoutSetsBlock } from './WorkoutSetsBlock';

type ActivePanel = 'warmup' | 'grips' | 'sets' | null;

export default function WorkoutExerciseCard({ we }: { we: WorkoutExercise }) {
  // Add defensive checks
  if (!we || !we.exercise) {
    return (
      <div className="rounded-xl border border-red-900/30 bg-[#1a0d0d] p-4">
        <div className="text-red-400">Exercise data missing</div>
      </div>
    );
  }

  const [active, setActive] = useState<ActivePanel>('warmup');
  const [warmupDone, setWarmupDone] = useState(false);

  const name = we.exercise.display_name || we.exercise.slug;
  const warmupSteps: {kg:number; reps:number; rest_s:number}[] = we?.attribute_values_json?.warmup ?? [];
  const totalNormal = we.workout_sets?.filter(s => s.set_kind !== 'warmup').length || 3;
  const doneNormal = we.workout_sets?.filter(s => s.set_kind !== 'warmup' && s.is_completed).length || 0;

  const IconBtn = ({
    onClick,
    activeWhen,
    children,
    label,
  }: {
    onClick: () => void;
    activeWhen: ActivePanel;
    children: React.ReactNode;
    label: string;
  }) => (
    <button
      aria-label={label}
      onClick={onClick}
      className={[
        'ml-2 rounded-md px-2 py-1 transition-colors',
        active === activeWhen ? 'bg-emerald-600/25' : 'bg-white/10 hover:bg-white/15',
      ].join(' ')}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-xl border border-emerald-900/30 bg-[#0d1a17] p-4">
      {/* HEADER ROW */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-emerald-200">{name}</h3>
          {/* mini nav icons inline with title */}
          <IconBtn label="Grips" activeWhen="grips" onClick={() => setActive(prev => (prev === 'grips' ? null : 'grips'))}>
            <Hand className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Sets" activeWhen="sets" onClick={() => setActive(prev => (prev === 'sets' ? null : 'sets'))}>
            <Hash className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Warmup" activeWhen="warmup" onClick={() => setActive(prev => (prev === 'warmup' ? null : 'warmup'))}>
            <Flame className="h-4 w-4" />
          </IconBtn>
        </div>
        <div className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-300">
          {doneNormal}/{totalNormal}
        </div>
      </div>

      {/* COLLAPSIBLE PANELS */}
      {/* Warmup: auto-hide after feedback; Fire icon can re-open */}
      {active === 'warmup' && !warmupDone && (
        <div className="mb-4 rounded-xl border border-emerald-900/30 bg-[#0f1f1b] p-3">
          <WarmupPanel
            topWeightKg={we.target_weight_kg ?? null}
            warmupSteps={Array.isArray(warmupSteps) ? warmupSteps : []}
            workoutExerciseId={we.id}
            attributeValuesJson={we.attribute_values_json}
            onFeedbackSubmitted={() => setWarmupDone(true)}
            compact
          />
        </div>
      )}

      {/* Grips (tiny) */}
      {active === 'grips' && (
        <div className="mb-4 rounded-xl border border-emerald-900/30 bg-[#0f1f1b] p-3">
          <p className="text-sm text-emerald-300/70">Grip options coming soon.</p>
        </div>
      )}

      {/* Sets */}
      {active === 'sets' && (
        <div className="rounded-xl border border-emerald-900/30 bg-[#0f1f1b] p-3">
          <WorkoutSetsBlock 
            workoutExerciseId={we.id}
            targetReps={we.target_reps}
            targetWeightKg={we.target_weight_kg}
            unit={we.weight_unit || 'kg'}
            workoutSets={we.workout_sets}
          />
        </div>
      )}
    </div>
  );
}