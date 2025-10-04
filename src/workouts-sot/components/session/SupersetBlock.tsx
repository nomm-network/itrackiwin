import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';
import { getSupersetLetter, getCurrentRound, type SupersetGroup } from '../../utils/supersetGrouping';
import { cn } from '@/lib/utils';

interface SupersetBlockProps {
  superset: SupersetGroup;
  currentExerciseId: string | null;
  onExerciseClick: (exerciseId: string) => void;
  children: React.ReactNode;
}

export function SupersetBlock({ 
  superset, 
  currentExerciseId, 
  onExerciseClick, 
  children 
}: SupersetBlockProps) {
  const currentRound = getCurrentRound(superset.exercises);
  const roundsTarget = superset.rounds_target;
  const progress = Math.min((currentRound - 1) / roundsTarget * 100, 100);
  
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <div className="p-4 space-y-4">
        {/* Superset Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Superset</h3>
            <Badge variant="outline" className="ml-2">
              Round {Math.min(currentRound, roundsTarget)}/{roundsTarget}
            </Badge>
          </div>
        </div>
        
        {/* Round Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.min(currentRound - 1, roundsTarget)}/{roundsTarget} rounds complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Exercise Pills */}
        <div className="flex gap-2 flex-wrap">
          {superset.exercises.map((ex, idx) => {
            const letter = getSupersetLetter(ex.superset_order || idx + 1);
            const isActive = ex.id === currentExerciseId;
            const completedSets = (ex.sets || []).filter((s: any) => s.is_completed).length;
            
            return (
              <button
                key={ex.id}
                onClick={() => onExerciseClick(ex.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  "flex items-center gap-1.5",
                  isActive 
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <span className="font-bold">{letter}</span>
                <span className="text-xs opacity-75">({completedSets} sets)</span>
              </button>
            );
          })}
        </div>
        
        {/* Exercise Content (forms, etc.) */}
        <div className="pt-2 border-t">
          {children}
        </div>
      </div>
    </Card>
  );
}
