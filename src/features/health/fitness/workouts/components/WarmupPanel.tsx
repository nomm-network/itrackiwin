import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Step = { kg:number; reps:number; rest_s:number };

export default function WarmupPanel({
  topWeightKg,
  warmupSteps,
  workoutExerciseId,
  attributeValuesJson,
  compact = true,
}: {
  topWeightKg: number | null;
  warmupSteps: Step[];
  workoutExerciseId?: string;
  attributeValuesJson?: any;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const steps = warmupSteps?.length ? warmupSteps : [];

  const handleFeedback = async (choice: 'too_easy' | 'good' | 'too_hard') => {
    if (!workoutExerciseId) return;
    
    await supabase
      .from('workout_exercises')
      .update({
        attribute_values_json: {
          ...attributeValuesJson,
          warmup_feedback: choice
        }
      })
      .eq('id', workoutExerciseId);
    
    setOpen(false);
  };

  if (!steps.length && topWeightKg == null) return null;

  return (
    <div className="mb-3 rounded-lg border border-emerald-900/30 bg-[#0f1f1b]">
      <button
        className="flex w-full items-center justify-between px-3 py-2 text-sm text-emerald-300"
        onClick={() => setOpen(v => !v)}
      >
        <span>Warmup</span>
        <span className="text-emerald-400/80">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3">
          <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-4'}`}>
            {steps.map((s, i) => (
              <div key={i} className="rounded-md bg-[#0b1714] px-2 py-2 text-center">
                <div className="text-xs text-emerald-400/80">{Math.round((s.kg / (topWeightKg || s.kg))*100)}%</div>
                <div className="text-sm text-emerald-200">{s.kg} kg</div>
                <div className="text-[11px] text-emerald-400/70">{s.reps} reps • {s.rest_s}s</div>
              </div>
            ))}
          </div>
          
          {workoutExerciseId && (
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => handleFeedback('too_easy')}
                className="px-2 py-1 text-xs bg-blue-700/70 text-white rounded hover:bg-blue-700"
              >
                Too Easy
              </button>
              <button 
                onClick={() => handleFeedback('good')}
                className="px-2 py-1 text-xs bg-emerald-700/70 text-white rounded hover:bg-emerald-700"
              >
                Good
              </button>
              <button 
                onClick={() => handleFeedback('too_hard')}
                className="px-2 py-1 text-xs bg-red-700/70 text-white rounded hover:bg-red-700"
              >
                Too Hard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}