import React from "react";
import TrainingDashboard from "@/features/health/fitness/ui/widgets/TrainingDashboard";

export default function FitnessBodyStable() {
  // This component must ONLY render the original Training Center + Quick Actions.
  // No gym switcher, no colorful tiles, no new cards.
  return <TrainingDashboard />;
}