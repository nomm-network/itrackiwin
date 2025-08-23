import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  ChevronUp,
  ChevronDown,
  Plus,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface SetData {
  id?: string;
  weight?: number;
  reps?: number;
  rpe?: number;
  notes?: string;
  set_index?: number;
  is_completed?: boolean;
}

interface ExerciseData {
  id: string;
  name: string;
  order_index: number;
  notes?: string;
  target_sets?: number; // Number of planned sets
}

interface EnhancedExerciseCardProps {
  exercise: ExerciseData;
  completedSets: SetData[];
  isActive: boolean;
  onToggleActive: () => void;
  onAddSet: () => void;
  onNextExercise: () => void;
  onScrollToNext?: () => void;
  children?: React.ReactNode; // For set entry form and completed sets display
  className?: string;
}

export const EnhancedExerciseCard: React.FC<EnhancedExerciseCardProps> = ({
  exercise,
  completedSets,
  isActive,
  onToggleActive,
  onAddSet,
  onNextExercise,
  onScrollToNext,
  children,
  className
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const targetSets = exercise.target_sets || 3; // Default to 3 sets if not specified
  const completedCount = completedSets.filter(set => set.is_completed).length;
  const allSetsCompleted = completedCount >= targetSets;
  const lastSet = completedSets[completedSets.length - 1];

  const handleNextExercise = () => {
    onNextExercise();
    // Auto-scroll to next exercise
    if (onScrollToNext) {
      setTimeout(() => {
        onScrollToNext();
      }, 100);
    }
  };

  return (
    <div ref={cardRef} className={cn("relative", className)}>
      <Card className={cn(
        "border rounded-md overflow-hidden transition-all duration-200",
        isActive && "ring-2 ring-primary/20 border-primary/40"
      )}>
        {/* Exercise Header - Always Visible */}
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors p-4"
          onClick={onToggleActive}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                #{exercise.order_index}
              </Badge>
              <CardTitle className="text-base md:text-lg">
                {exercise.name}
              </CardTitle>
              {allSetsCompleted && (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Complete
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {completedCount}/{targetSets} sets
              </Badge>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isActive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Collapsed Summary */}
          {!isActive && lastSet && (
            <div className="mt-2 text-xs text-muted-foreground">
              Last: {lastSet.weight}kg × {lastSet.reps} reps
              {lastSet.rpe && ` • RPE ${lastSet.rpe}`}
            </div>
          )}
        </CardHeader>
        
        {/* Exercise Details - Expandable */}
        {isActive && (
          <CardContent className="p-4 border-t bg-background">
            {/* Progress indicator */}
            <div className="flex gap-1 mb-4">
              {[...Array(targetSets)].map((_, index) => {
                const setNum = index + 1;
                const setCompleted = completedSets.find(s => s.set_index === setNum && s.is_completed);
                const isNext = setNum === completedCount + 1 && !allSetsCompleted;
                
                return (
                  <div
                    key={setNum}
                    className={cn(
                      "flex-1 h-2 rounded-full transition-colors",
                      setCompleted 
                        ? "bg-green-500" 
                        : isNext 
                          ? "bg-yellow-400" 
                          : "bg-muted"
                    )}
                  />
                );
              })}
            </div>

            {/* Main content (sets, form, etc.) */}
            {children}
          </CardContent>
        )}
      </Card>

      {/* Sticky Footer - Only shown when active and sets are completed */}
      {isActive && allSetsCompleted && (
        <div className="sticky bottom-0 left-0 right-0 z-10 mt-4">
          <Card className="bg-background/95 backdrop-blur-sm border border-green-200 dark:border-green-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                {/* Primary Action - Next Exercise */}
                <Button 
                  onClick={handleNextExercise}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Next Exercise
                </Button>

                {/* Secondary Actions */}
                <div className="flex items-center gap-2">
                  {/* Add Another Set - Hidden in mobile, shown in dropdown */}
                  <Button 
                    onClick={onAddSet}
                    variant="ghost" 
                    size="lg"
                    className="hidden sm:flex"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Set
                  </Button>

                  {/* More Menu for Mobile */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="lg" className="sm:hidden">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onAddSet}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Set
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};