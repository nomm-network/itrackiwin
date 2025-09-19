import React from 'react';

interface DebugPanelProps {
  enabled?: boolean;
  exercise?: any;
  formSelected?: string;
  latestWeightKg?: number;
  lastSet?: any;
}

export const WorkoutFormDebugPanel: React.FC<DebugPanelProps> = ({ 
  enabled = true, 
  exercise, 
  formSelected,
  latestWeightKg,
  lastSet 
}) => {
  if (!enabled) return null;

  return (
    <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
      <div className="font-bold text-blue-600 dark:text-blue-400 mb-2">
        🪪 Debug v0.4.1
      </div>
      
      {exercise && (
        <div className="space-y-1">
          <div><strong>Exercise:</strong> {exercise.id?.slice(0, 8)}... | {exercise.name || 'Unnamed'}</div>
          <div>
            <strong>load_mode:</strong> 
            <span className={exercise.load_mode ? 'text-green-600' : 'text-red-600 font-bold'}>
              {exercise.load_mode || 'MISSING load_mode'}
            </span>
          </div>
          <div><strong>effort_mode:</strong> {exercise.effort_mode || 'reps'}</div>
          <div><strong>equipment_id:</strong> {(exercise as any).equipment_id || 'none'}</div>
          <div><strong>formSelected:</strong> {formSelected || 'unknown'}</div>
          <div><strong>latestWeightKg:</strong> {latestWeightKg || 'none'}</div>
          
          {lastSet && (
            <div className="mt-2 pt-2 border-t border-slate-300 dark:border-slate-600">
              <div><strong>Last Set:</strong></div>
              <div>weight_kg: {lastSet.weight_kg}</div>
              <div>total_weight_kg: {lastSet.total_weight_kg}</div>
              <div>load_meta: {JSON.stringify(lastSet.load_meta)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};