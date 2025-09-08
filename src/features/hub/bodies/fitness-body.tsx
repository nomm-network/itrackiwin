import React from "react";
import TrainingCenterCard from "@/features/health/fitness/components/TrainingCenterCard";
import QuickActionsRow from "@/features/health/fitness/components/QuickActionsRow";

// Fallback Quick Actions that matches the old grid layout enough to unblock UI
function InlineQuickActions() {
  return (
    <div style={{marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
      <a href="/training/templates" style={tile("#2e7bff")}>Templates</a>
      <a href="/training/history"   style={tile("#ff8a1f")}>History</a>
      <a href="/training/programs"  style={tile("#7b61ff")}>Programs</a>
      <a href="/mentors"            style={tile("#00c37a")}>Mentors</a>
    </div>
  );
  function tile(bg:string){
    return {
      display:"flex", alignItems:"center", justifyContent:"center",
      height:88, borderRadius:16, background:bg, color:"#0b0f12",
      fontWeight:700, textDecoration:"none"
    } as React.CSSProperties;
  }
}

export default function FitnessBody() {
  return (
    <>
      <TrainingCenterCard />
      <QuickActionsRow />
    </>
  );
}