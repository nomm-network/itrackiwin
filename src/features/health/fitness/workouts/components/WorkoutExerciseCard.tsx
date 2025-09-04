import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import WarmupCard from './WarmupCard';
import SetCard from './SetCard';

interface Exercise {
  id: string;
  exercise_id?: string;
  target_sets?: number;
  target_reps?: number;
  target_weight_kg?: number;
  weight_unit?: string;
  exercises?: {
    id: string;
    display_name: string;
    slug: string;
  };
  workout_sets?: Array<{
    id: string;
    set_index: number;
    weight_kg?: number;
    reps?: number;
    is_completed: boolean;
    set_kind?: 'warmup' | 'normal' | 'drop' | 'amrap';
    rest_seconds?: number;
  }>;
}

interface Props {
  exercise: Exercise;
  onAddSet?: (exerciseId: string) => void;
  onCompleteSet?: (setId: string, data: { weight_kg: number; reps: number }) => void;
}

const WorkoutExerciseCard: React.FC<Props> = ({ exercise, onAddSet, onCompleteSet }) => {
  const exerciseName = exercise.exercises?.display_name || 'Unknown Exercise';
  const sets = exercise.workout_sets || [];
  const completedSets = sets.filter(set => set.is_completed);
  const targetSets = exercise.target_sets || 3;

  return (
    <div className="mb-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{exerciseName}</CardTitle>
            <Badge variant="outline">
              {completedSets.length}/{targetSets} sets
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Target Set Display */}
            <SetCard
              set={{
                set_index: 0,
                target_weight_kg: exercise.target_weight_kg,
                target_reps: exercise.target_reps,
                set_kind: 'normal'
              }}
              isTarget={true}
            />

            {/* Warmup Section */}
            <WarmupCard exercise={exercise} />

            {/* Working Sets */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Working Sets</h4>
              {sets.map((set) => (
                <SetCard
                  key={set.id}
                  set={set}
                  onComplete={(data) => onCompleteSet?.(set.id, data)}
                />
              ))}
              
              {/* Add Set Button */}
              {completedSets.length < targetSets && (
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => onAddSet?.(exercise.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Set {sets.length + 1}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutExerciseCard;