// src/features/health/fitness/workouts/components/WarmupPanel.tsx
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function WarmupPanel(props: {
  topKg?: number | null;
  steps?: { kg:number; reps:number; rest_s:number }[];
  exerciseId?: string;
  workoutExerciseId?: string;
  exerciseName?: string;
  topWeightKg?: number | null;
  warmupSteps?: any;
  compact?: boolean;
  onWarmupRecalculated?: () => Promise<void>;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTools, setShowTools] = useState(false);
  
  // Handle legacy props
  const topWeight = props.topKg ?? props.topWeightKg ?? 60;
  const steps = props.steps ?? props.warmupSteps ?? [];
  
  const handleFeedback = async (value: 'too_little' | 'excellent' | 'too_much') => {
    if (!props.workoutExerciseId) return;
    
    try {
      // Save feedback to database
      await supabase.from('workout_exercise_feedback').upsert({
        workout_exercise_id: props.workoutExerciseId,
        warmup_rating: value,
      }, { onConflict: 'workout_exercise_id' });
      
      // Recalculate warmup if not excellent
      if (value !== 'excellent' && props.workoutExerciseId) {
        await supabase.rpc('recalc_warmup_from_last_set', {
          p_workout_exercise_id: props.workoutExerciseId
        });
      }
      
      // Collapse panel and refresh
      setIsCollapsed(true);
      if (props.onWarmupRecalculated) {
        await props.onWarmupRecalculated();
      }
    } catch (error) {
      console.error('Failed to save warmup feedback:', error);
    }
  };

  if (isCollapsed) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-2 mb-2">
        <div className="flex items-center justify-between">
          <div className="text-sm">Warm-up completed ✅</div>
          <button 
            onClick={() => setIsCollapsed(false)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Show
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Warm-up 🏋️‍♀️</div>
        <button 
          onClick={() => setShowTools(!showTools)}
          className="text-xs opacity-70 hover:opacity-100"
        >
          Tools
        </button>
      </div>
      
      <div className="text-sm opacity-80 mt-1">
        Strategy: ramped • Top: {topWeight}kg • Auto-adjusts from feedback
      </div>

      {showTools && (
        <div className="mt-2 flex gap-2">
          <button className="text-xs bg-neutral-800 px-2 py-1 rounded">🖐️ Grips</button>
          <button 
            onClick={() => setIsCollapsed(true)}
            className="text-xs bg-neutral-800 px-2 py-1 rounded"
          >
            🔥 Hide Warm-up
          </button>
        </div>
      )}

      <div className="mt-3 rounded-lg bg-neutral-950/60 p-3">
        {steps.map((s: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between py-1">
            <div>{s.kg}kg × {s.reps} reps</div>
            <div className="opacity-70">{s.rest_s}s rest</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button 
          onClick={() => handleFeedback('too_little')}
          className="rounded-lg bg-neutral-900 px-3 py-2 hover:bg-neutral-800"
        >
          🥶 Too little
        </button>
        <button 
          onClick={() => handleFeedback('excellent')}
          className="rounded-lg bg-neutral-900 px-3 py-2 hover:bg-neutral-800"
        >
          🔥 Excellent
        </button>
        <button 
          onClick={() => handleFeedback('too_much')}
          className="rounded-lg bg-neutral-900 px-3 py-2 hover:bg-neutral-800"
        >
          🥵 Too much
        </button>
      </div>
    </div>
  );
}