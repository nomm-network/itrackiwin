import React from 'react';

interface WorkoutDebugBoxProps {
  exercise?: any;
  version?: string;
  currentForm?: string;
  debug?: any;
}

export const WorkoutDebugBox: React.FC<WorkoutDebugBoxProps> = ({ 
  exercise, 
  version = "v2.0-bodyweight-step2",
  currentForm = "unknown",
  debug = {}
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="fixed top-20 right-4 z-50 max-w-xs">
      <div className="bg-red-900/90 border border-red-500 rounded-lg p-3 text-white text-xs">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="font-mono font-bold">🐛 DEBUG {version}</div>
          <div className="text-red-300">{isExpanded ? '−' : '+'}</div>
        </div>
        
        <div className="mt-1 space-y-1">
          <div><span className="text-red-300">Form:</span> {currentForm}</div>
          <div><span className="text-red-300">Router:</span> {(window as any).__WF_STEP__ || 'none'}</div>
        </div>

        {isExpanded && (
          <div className="mt-3 space-y-2 text-xs">
            <div className="border-t border-red-500 pt-2">
              <div className="text-red-300 font-bold">Exercise Data:</div>
              <div>effort_mode: {exercise?.exercise?.effort_mode || exercise?.effort_mode || 'none'}</div>
              <div>load_mode: {exercise?.exercise?.load_mode || exercise?.load_mode || 'none'}</div>
              <div>equipment: {exercise?.exercise?.equipment?.slug || exercise?.equipment?.slug || 'none'}</div>
            </div>
            
            <div className="border-t border-red-500 pt-2">
              <div className="text-red-300 font-bold">Debug Info:</div>
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(debug, null, 2)}
              </pre>
            </div>

            <div className="border-t border-red-500 pt-2">
              <div className="text-red-300 font-bold">Full Exercise:</div>
              <pre className="whitespace-pre-wrap text-xs max-h-32 overflow-y-auto">
                {JSON.stringify({
                  exerciseId: exercise?.exercise_id || exercise?.id,
                  exerciseName: exercise?.exercise?.display_name || exercise?.display_name,
                  effort_mode: exercise?.exercise?.effort_mode || exercise?.effort_mode,
                  load_mode: exercise?.exercise?.load_mode || exercise?.load_mode,
                  equipment: exercise?.exercise?.equipment || exercise?.equipment,
                  raw: exercise
                }, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};