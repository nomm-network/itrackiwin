// src/features/health/fitness/workouts/components/WorkoutHeader.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface WorkoutHeaderProps {
  templateName?: string;
  onEndWorkout?: () => void;
  workout?: any;
  title?: string;
  subtitle?: string;
  onExit?: () => void;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({ templateName, onEndWorkout, workout, title, subtitle, onExit }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-bold">
        {title || templateName || workout?.title || "Workout Session"}
      </h1>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onExit || (() => navigate("/app/dashboard"))}
        >
          Back
        </Button>
        {onEndWorkout && (
          <Button variant="destructive" onClick={onEndWorkout}>
            Finish Workout
          </Button>
        )}
      </div>
    </div>
  );
};

export default WorkoutHeader;