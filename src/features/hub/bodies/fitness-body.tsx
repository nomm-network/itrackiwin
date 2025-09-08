import React from "react";
import TrainingDashboard from "@/features/health/fitness/ui/widgets/TrainingDashboard";

export default function FitnessBodyStable() {
  // Only render the original Training Center + Quick Actions - no gym switcher or new tiles
  return <TrainingDashboard />;
}