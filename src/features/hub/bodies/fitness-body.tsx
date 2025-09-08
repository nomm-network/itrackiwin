import React from "react";
import TrainingDashboard from "@/features/health/fitness/ui/widgets/TrainingDashboard";

export default function FitnessBodyStable() {
  // Only render the original Training Center + Quick Actions - no gym switcher or new tiles
  if (!TrainingDashboard) {
    throw new Error("FitnessBodyStable missing TrainingDashboard component. Check imports/paths.");
  }
  return <TrainingDashboard />;
}