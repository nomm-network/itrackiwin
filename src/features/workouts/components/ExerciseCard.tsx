import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    primary_muscle?: string;
    equipment?: string;
  };
  onSelect?: (exerciseId: string) => void;
}

export default function ExerciseCard({ exercise, onSelect }: ExerciseCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect?.(exercise.id)}
    >
      <CardHeader>
        <CardTitle className="text-base">{exercise.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {exercise.primary_muscle && (
            <Badge variant="secondary">{exercise.primary_muscle}</Badge>
          )}
          {exercise.equipment && (
            <Badge variant="outline">{exercise.equipment}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}