import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDefaultSetsLogic, getUserTrainingProfile } from '@/hooks/useDefaultSetsLogic';
import { useFitnessProfile } from '@/features/health/fitness/hooks/useFitnessProfile.hook';
import { Target, Plus, Minus } from 'lucide-react';

interface DefaultSetsManagerProps {
  exerciseId: string;
  currentSets: number;
  onSetsChange: (newSets: number) => void;
  onApplyDefaults: (sets: number, reps: number) => void;
}

export const DefaultSetsManager: React.FC<DefaultSetsManagerProps> = ({
  exerciseId,
  currentSets,
  onSetsChange,
  onApplyDefaults
}) => {
  const { data: fitnessProfile } = useFitnessProfile();
  const userProfile = getUserTrainingProfile(fitnessProfile);
  const defaultsLogic = useDefaultSetsLogic(userProfile);

  const adjustSets = (adjustment: number) => {
    const newSets = Math.max(1, Math.min(8, currentSets + adjustment));
    onSetsChange(newSets);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4" />
          Sets & Reps for this Exercise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current sets display with adjustment */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sets:</span>
            <Badge variant="outline">{currentSets}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => adjustSets(-1)}
              disabled={currentSets <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => adjustSets(1)}
              disabled={currentSets >= 8}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Bro's recommendation */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">BRO RECOMMENDS</span>
            <Badge variant="secondary" className="text-xs">
              {userProfile.focus} • {userProfile.experience}
            </Badge>
          </div>
          <div className="text-sm">
            <span className="font-medium">{defaultsLogic.sets} sets × {defaultsLogic.reps} reps</span>
          </div>
          {defaultsLogic.notes && (
            <p className="text-xs text-muted-foreground mt-1">
              {defaultsLogic.notes}
            </p>
          )}
        </div>

        {/* Apply defaults button */}
        {(currentSets !== defaultsLogic.sets) && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onApplyDefaults(defaultsLogic.sets, defaultsLogic.reps)}
            className="w-full"
          >
            Apply Bro's Recommendation ({defaultsLogic.sets} sets)
          </Button>
        )}
      </CardContent>
    </Card>
  );
};