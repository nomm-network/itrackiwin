// DebugPanel.tsx
import React from 'react';

export function DebugPanel({
  workoutId,
  workout,
  exercises,
  firstExercise,
  setsByExercise,
  lastError,
}: {
  workoutId?: string;
  workout?: any;
  exercises?: any[];
  firstExercise?: any;
  setsByExercise?: Record<string, any[]>;
  lastError?: any;
}) {
  // Always show debug panel
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-black/85 text-green-400 p-3 rounded-lg font-mono text-xs max-h-96 overflow-auto">
        <div>🐞 <b>DEBUG</b></div>
        <div>workoutId: {workoutId || '—'}</div>
        <div>title: {workout?.title || (workout as any)?.workout_templates?.name || firstExercise?.exercise?.display_name || '—'}</div>
        <div>exercises: {exercises?.length ?? 0}</div>
        <div>firstExerciseId: {firstExercise?.id || '—'}</div>
        <div>first target: {firstExercise?.target_weight_kg ?? '—'} kg × {firstExercise?.target_reps ?? '—'}</div>
        <div>exercise keys: {exercises ? Object.keys(exercises[0] || {}).join(', ') : '—'}</div>
        <div>exercise.exercise keys: {firstExercise?.exercise ? Object.keys(firstExercise.exercise).join(', ') : '—'}</div>
        
        {/* ALL EXERCISE NAMES */}
        <div style={{marginTop: '10px'}}>
          <b>ALL EXERCISES:</b>
          {exercises?.map((ex, i) => (
            <div key={ex.id} style={{marginLeft: '10px', fontSize: '11px'}}>
              {i+1}. {ex.exercise?.display_name || 'NO NAME'} (id: {ex.id})
              <br />- sets: {ex.workout_sets?.length ?? 0} | setsByExercise: {setsByExercise?.[ex.id]?.length ?? 0}
              <br />- workout_sets keys: {ex.workout_sets?.[0] ? Object.keys(ex.workout_sets[0]).join(', ') : 'no sets'}
            </div>
          )) || <div>No exercises found</div>}
        </div>
        
        <div>warmup json:
          <pre style={{whiteSpace:'pre-wrap'}}>
            {JSON.stringify(firstExercise?.attribute_values_json?.warmup ?? firstExercise?.attribute_values_json ?? {}, null, 2)}
          </pre>
        </div>
        <div>sets for first ex: { (setsByExercise?.[firstExercise?.id || '']?.length) ?? 0 }</div>
        <div>full exercise data:
          <pre style={{whiteSpace:'pre-wrap', maxHeight: '200px', overflow: 'auto'}}>
            {JSON.stringify(firstExercise, null, 2)}
          </pre>
        </div>
        {lastError && (
          <>
            <div style={{color:'#f66'}}>error:</div>
            <pre style={{whiteSpace:'pre-wrap', color:'#f66'}}>
              {typeof lastError === 'string' ? lastError : JSON.stringify(lastError, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}