// ⚠️ DO NOT change visuals here; just import the frozen components
import React from "react";
import TrainingCenterCard from "@/features/health/fitness/components/TrainingCenterCard";
import QuickActionsRow    from "@/features/health/fitness/components/QuickActionsRow";

export default function FitnessBody() {
  return (
    <>
      <TrainingCenterCard />
      <QuickActionsRow />
    </>
  );
}