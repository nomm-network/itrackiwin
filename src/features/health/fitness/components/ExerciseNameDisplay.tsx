import { useExerciseTranslation } from "@/hooks/useExerciseTranslations";

interface ExerciseNameDisplayProps {
  exerciseId: string;
  className?: string;
}

export const ExerciseNameDisplay = ({ exerciseId, className }: ExerciseNameDisplayProps) => {
  const { data: translation } = useExerciseTranslation(exerciseId);
  
  return (
    <div className={`font-medium ${className}`}>
      {translation?.name || `Exercise ${exerciseId.slice(0, 8)}`}
    </div>
  );
};