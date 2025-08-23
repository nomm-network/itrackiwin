import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Target, Star } from 'lucide-react';
import { useMuscleGroups } from '../hooks/useMuscleGroups.hook';
import { useMusclePriorities, useUpsertMusclePriorities } from '../hooks/useMusclePriorities.hook';

interface SelectedPriority {
  muscle_id: string;
  muscle_name: string;
  priority_level: number;
}

const PRIORITY_LABELS = {
  1: { label: 'Primary Focus', icon: Star, color: 'bg-yellow-500' },
  2: { label: 'Secondary Focus', icon: Target, color: 'bg-blue-500' },
  3: { label: 'Tertiary Focus', icon: Plus, color: 'bg-green-500' }
};

export const MuscleGroupPicker = () => {
  const { data: muscleGroups = [], isLoading: muscleGroupsLoading } = useMuscleGroups();
  const { data: currentPriorities = [], isLoading: prioritiesLoading } = useMusclePriorities();
  const upsertPriorities = useUpsertMusclePriorities();

  const [selectedPriorities, setSelectedPriorities] = useState<SelectedPriority[]>([]);

  // Initialize selected priorities from current data
  React.useEffect(() => {
    if (currentPriorities.length > 0) {
      setSelectedPriorities(
        currentPriorities.map(cp => ({
          muscle_id: cp.muscle_id,
          muscle_name: cp.muscle_name,
          priority_level: cp.priority_level
        }))
      );
    }
  }, [currentPriorities]);

  const handleMuscleSelect = (muscleId: string, muscleName: string) => {
    if (selectedPriorities.find(sp => sp.muscle_id === muscleId)) return;
    if (selectedPriorities.length >= 3) return;

    const nextPriorityLevel = selectedPriorities.length + 1;
    setSelectedPriorities([
      ...selectedPriorities,
      {
        muscle_id: muscleId,
        muscle_name: muscleName,
        priority_level: nextPriorityLevel
      }
    ]);
  };

  const handleRemovePriority = (muscleId: string) => {
    const filtered = selectedPriorities.filter(sp => sp.muscle_id !== muscleId);
    // Renumber priority levels
    const renumbered = filtered.map((sp, index) => ({
      ...sp,
      priority_level: index + 1
    }));
    setSelectedPriorities(renumbered);
  };

  const handleSave = async () => {
    await upsertPriorities.mutateAsync(
      selectedPriorities.map(sp => ({
        muscle_id: sp.muscle_id,
        priority_level: sp.priority_level
      }))
    );
  };

  const isSelected = (muscleId: string) => 
    selectedPriorities.some(sp => sp.muscle_id === muscleId);

  if (muscleGroupsLoading || prioritiesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading muscle groups...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Prioritized Muscle Groups
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select up to 3 muscle groups to prioritize in your training. These will receive increased volume and focus.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected Priorities */}
          {selectedPriorities.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Current Priorities</h4>
              <div className="space-y-2">
                {selectedPriorities.map((priority) => {
                  const config = PRIORITY_LABELS[priority.priority_level as keyof typeof PRIORITY_LABELS];
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={priority.muscle_id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{priority.muscle_name}</div>
                          <div className="text-xs text-muted-foreground">{config.label}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePriority(priority.muscle_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Muscle Group Selection */}
          {selectedPriorities.length < 3 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">
                Available Muscle Groups
                <Badge variant="outline" className="ml-2">
                  {selectedPriorities.length}/3 selected
                </Badge>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {muscleGroups.map((muscle) => (
                  <Button
                    key={muscle.id}
                    variant={isSelected(muscle.id) ? "default" : "outline"}
                    size="sm"
                    className="justify-start h-auto p-3"
                    disabled={isSelected(muscle.id)}
                    onClick={() => handleMuscleSelect(muscle.id, muscle.name)}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected(muscle.id) ? (
                        <Star className="h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      <span className="text-xs">{muscle.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={upsertPriorities.isPending}
              className="flex items-center gap-2"
            >
              {upsertPriorities.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Save Priorities
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Priority Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How Priorities Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span><strong>Primary (1st):</strong> +30% volume, priority in exercise selection</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span><strong>Secondary (2nd):</strong> +20% volume, secondary emphasis</span>
            </div>
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-green-500" />
              <span><strong>Tertiary (3rd):</strong> +10% volume, maintained focus</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};