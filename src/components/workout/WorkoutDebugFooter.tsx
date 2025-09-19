import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronUp, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebugInfo {
  version: string;
  router: string;
  logger: string;
  sessionSource?: string; // Track which wrapper/entry point was used
  restTimer: boolean;
  grips: boolean;
  gripKey?: string | null;
  warmup: boolean;
  warmupSteps?: number;
  entryMode: 'per_side' | 'total' | 'bodyweight';
  payloadPreview?: Record<string, any>;
}

interface WorkoutDebugFooterProps {
  debugInfo: DebugInfo;
  className?: string;
}

export const WorkoutDebugFooter: React.FC<WorkoutDebugFooterProps> = ({
  debugInfo,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatPayload = (payload?: Record<string, any>) => {
    if (!payload) return 'No preview available';
    return JSON.stringify(payload, null, 2);
  };

  return (
    <div className={cn("fixed bottom-4 left-4 right-4 z-50", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-center">
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80 transition-colors"
            >
              <Bug className="w-3 h-3 mr-1" />
              {debugInfo.version}
              <ChevronUp className={cn(
                "w-3 h-3 ml-1 transition-transform",
                isOpen && "rotate-180"
              )} />
            </Badge>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-2 p-4 bg-background border rounded-lg shadow-lg text-xs font-mono space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>sessionSource: {debugInfo.sessionSource || 'direct'}</div>
              <div>router: {debugInfo.router}</div>
              <div>logger: {debugInfo.logger}</div>
              <div>restTimer: {debugInfo.restTimer ? 'on' : 'off'}</div>
              <div>
                grips: {debugInfo.grips ? 'on' : 'off'} 
                {debugInfo.gripKey && ` (key=${debugInfo.gripKey})`}
              </div>
              <div>
                warmup: {debugInfo.warmup ? 'on' : 'off'}
                {debugInfo.warmupSteps && ` (steps=${debugInfo.warmupSteps})`}
              </div>
              <div>entryMode: {debugInfo.entryMode}</div>
            </div>
            
            {debugInfo.payloadPreview && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-muted-foreground mb-1">payloadPreview:</div>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {formatPayload(debugInfo.payloadPreview)}
                </pre>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default WorkoutDebugFooter;