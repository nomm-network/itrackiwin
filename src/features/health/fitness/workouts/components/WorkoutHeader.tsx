// src/features/health/fitness/workouts/components/WorkoutHeader.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface WorkoutHeaderProps {
  templateName?: string;
  onEndWorkout: () => void;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({ templateName, onEndWorkout }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-bold">
        {templateName ? templateName : "Workout Session"}
      </h1>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate("/app/dashboard")}
        >
          Back
        </Button>
        <Button variant="destructive" onClick={onEndWorkout}>
          Finish Workout
        </Button>
      </div>
    </div>
  );
};

export default WorkoutHeader;