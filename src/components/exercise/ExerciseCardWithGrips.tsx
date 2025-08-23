import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripSelector } from "./GripSelector";
import { EffectiveMuscles } from "./EffectiveMuscles";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  name: string;
  equipment_id?: string;
  description?: string;
}

interface ExerciseCardWithGripsProps {
  exercise: Exercise;
  onGripChange?: (exerciseId: string, gripIds: string[]) => void;
  className?: string;
}

export const ExerciseCardWithGrips = ({ 
  exercise, 
  onGripChange,
  className 
}: ExerciseCardWithGripsProps) => {
  const [selectedGripIds, setSelectedGripIds] = useState<string[]>([]);

  const handleGripChange = (gripIds: string[]) => {
    setSelectedGripIds(gripIds);
    onGripChange?.(exercise.id, gripIds);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{exercise.name}</CardTitle>
        {exercise.description && (
          <p className="text-sm text-muted-foreground">{exercise.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Grip Selection */}
        <div>
          <h4 className="text-sm font-medium mb-2">Grips</h4>
          <GripSelector
            exerciseId={exercise.id}
            selectedGripIds={selectedGripIds}
            onGripChange={handleGripChange}
          />
        </div>

        {/* Dynamic Muscle Emphasis */}
        <div>
          <h4 className="text-sm font-medium mb-2">Muscle Emphasis</h4>
          <EffectiveMuscles
            exerciseId={exercise.id}
            gripIds={selectedGripIds.length > 0 ? selectedGripIds : undefined}
            equipmentId={exercise.equipment_id}
          />
        </div>
      </CardContent>
    </Card>
  );
};