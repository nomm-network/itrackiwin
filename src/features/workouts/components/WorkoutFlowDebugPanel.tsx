import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface WorkoutFlowDebugPanelProps {
  enabled?: boolean;
  debugTag: string;
  selectedForm?: string;
  exercise?: {
    load_mode?: string;
    effort_mode?: string;
    equipment_id?: string;
  };
  latestWeightKg?: number;
  lastPayload?: any;
  // v0.5.2 specific fields
  assistMode?: 'added' | 'assist';
  inputMagnitude?: number;
  signedWeightToSend?: number;
}

export const WorkoutFlowDebugPanel: React.FC<WorkoutFlowDebugPanelProps> = ({
  enabled = true,
  debugTag,
  selectedForm,
  exercise,
  latestWeightKg,
  lastPayload,
  assistMode,
  inputMagnitude,
  signedWeightToSend
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!enabled) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-300 mb-2">
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        {debugTag}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-300 space-y-2">
          <div><strong>router.selectedForm:</strong> {selectedForm || 'unknown'}</div>
          {exercise && (
            <>
              <div><strong>exercise.load_mode:</strong> {exercise.load_mode || 'none'}</div>
              <div><strong>exercise.effort_mode:</strong> {exercise.effort_mode || 'none'}</div>
              <div><strong>exercise.equipment_id:</strong> {exercise.equipment_id || 'none'}</div>
            </>
          )}
          <div><strong>latestWeightKg:</strong> {latestWeightKg || 'none'}</div>
          {/* v0.5.2 specific debug info */}
          {exercise?.load_mode === 'bodyweight_plus_optional' && (
            <>
              <div><strong>assistMode:</strong> {assistMode || 'none'}</div>
              <div><strong>inputMagnitude:</strong> {inputMagnitude || 'none'}</div>
              <div><strong>signedWeightToSend:</strong> {signedWeightToSend || 'none'}</div>
            </>
          )}
          {lastPayload && (
            <div className="pt-2 border-t border-zinc-700">
              <div><strong>Last payload preview:</strong></div>
              <pre className="text-xs bg-zinc-800/50 p-2 rounded overflow-x-auto">
                {JSON.stringify(lastPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};