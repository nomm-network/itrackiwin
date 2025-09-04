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
  
  const sx: React.CSSProperties = {
    position: 'fixed',
    top: 8,
    left: 8,
    zIndex: 99999,
    maxWidth: '92vw',
    pointerEvents: 'none',
  };
  
  const box: React.CSSProperties = {
    background: 'rgba(0,0,0,.85)',
    color: '#0f0',
    padding: 10,
    borderRadius: 10,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
    pointerEvents: 'auto',
    maxHeight: '70vh',
    overflow: 'auto',
  };
  
  return (
    <div style={sx}>
      <div style={box}>
        <div>🐞 <b>DEBUG</b></div>
        <div>workoutId: {workoutId || '—'}</div>
        <div>title: {workout?.title || (workout as any)?.workout_templates?.name || firstExercise?.exercise?.display_name || '—'}</div>
        <div>exercises: {exercises?.length ?? 0}</div>
        <div>firstExerciseId: {firstExercise?.id || '—'}</div>
        <div>first target: {firstExercise?.target_weight_kg ?? '—'} kg × {firstExercise?.target_reps ?? '—'}</div>
        <div>exercise keys: {exercises ? Object.keys(exercises[0] || {}).join(', ') : '—'}</div>
        <div>exercise.exercise keys: {firstExercise?.exercise ? Object.keys(firstExercise.exercise).join(', ') : '—'}</div>
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