import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffectiveMuscles } from "@/hooks/useEffectiveMuscles";
import { SetFeelSelector } from "@/features/health/fitness/components/SetFeelSelector";
import GripChips from "@/features/exercises/components/GripChips";
import { Plus, ArrowRight, Settings, Dumbbell } from "lucide-react";
import { useExerciseTranslation } from "@/hooks/useExerciseTranslations";
import { WarmupBlock } from "@/components/fitness/WarmupBlock";

interface ExerciseCardProps {
  exercise: {
    id: string;
    primary_muscle?: string;
    equipment?: string;
    default_grip_ids?: string[];
  };
  completedSets?: number;
  targetSets?: number;
  isActive?: boolean;
  currentSetId?: string;
  selectedGripIds?: string[];
  workoutExerciseId?: string;
  showWarmup?: boolean;
  onSelect?: (exerciseId: string) => void;
  onAddSet?: () => void;
  onNextExercise?: () => void;
  onGripChange?: (gripIds: string[]) => void;
}

export default function ExerciseCard({ 
  exercise, 
  completedSets = 0,
  targetSets = 3,
  isActive = false,
  currentSetId,
  selectedGripIds = exercise.default_grip_ids || [],
  workoutExerciseId,
  showWarmup = false,
  onSelect,
  onAddSet,
  onNextExercise,
  onGripChange
}: ExerciseCardProps) {
  const { data: translation } = useExerciseTranslation(exercise.id);
  const { data: effectiveMuscles } = useEffectiveMuscles(
    exercise.id, 
    selectedGripIds.length > 0 ? selectedGripIds : undefined,
    exercise.equipment
  );

  const isCompleted = completedSets >= targetSets;
  const progressPercent = Math.min((completedSets / targetSets) * 100, 100);

  return (
    <Card 
      className={`transition-all ${
        isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
      } ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}
      onClick={() => onSelect?.(exercise.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base flex-1">{translation?.name || `Exercise ${exercise.id}`}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {completedSets}/{targetSets} sets
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Grip Selection */}
        {exercise.default_grip_ids && exercise.default_grip_ids.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Grip Options</label>
            <div className="flex flex-wrap gap-1">
              {selectedGripIds.map(gripId => (
                <Badge key={gripId} variant="outline" className="text-xs">
                  Grip {gripId.slice(0, 8)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Effective Muscles */}
        {effectiveMuscles && effectiveMuscles.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Muscle Activation</label>
            <div className="flex flex-wrap gap-1">
              {effectiveMuscles.map((muscle) => (
                <Badge 
                  key={muscle.muscle_id}
                  variant={muscle.primary_muscle ? "default" : "secondary"}
                  className="text-xs"
                >
                  {muscle.effective_score}% {muscle.base_role}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Equipment badge */}
        {exercise.equipment && (
          <Badge variant="outline" className="w-fit">
            {exercise.equipment}
          </Badge>
        )}

        {/* Feel selector for current set */}
        {isActive && currentSetId && (
          <SetFeelSelector 
            setId={currentSetId}
            onFeelChange={(feel) => console.log('Feel updated:', feel)}
          />
        )}

        {/* Warmup section for active exercise */}
        {isActive && showWarmup && workoutExerciseId && (
          <WarmupBlock 
            workoutExerciseId={workoutExerciseId}
            onFeedbackGiven={() => console.log('Warmup feedback given')}
          />
        )}
      </CardContent>

      {/* Footer with action buttons */}
      {isActive && (
        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddSet?.();
              }}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Set
            </Button>
            
            <Button
              variant={isCompleted ? "default" : "secondary"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onNextExercise?.();
              }}
              className="flex-1"
            >
              {isCompleted ? "Next Exercise" : "Skip"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}