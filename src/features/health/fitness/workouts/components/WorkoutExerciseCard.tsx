// src/features/health/fitness/workouts/components/WorkoutExerciseCard.tsx
import React from "react";
import WarmupBlock from "./WarmupBlock";
import WorkoutSetsBlock from "./WorkoutSetsBlock";

interface WorkoutExerciseCardProps {
  title: string;
  totalSets?: number;
  children: React.ReactNode;
  targetReps?: number;
  targetWeightKg?: number;
  unit?: string;
}

const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({ title, totalSets, children }) => {
  return (
    <section className="card rounded-lg border bg-card">
      <header className="card-header p-4 border-b">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="text-xs opacity-70">{totalSets ?? 0} sets</span>
      </header>
      <div className="card-body p-4">{children}</div>
    </section>
  );
};

export default WorkoutExerciseCard;