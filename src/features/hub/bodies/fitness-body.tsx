// src/features/hub/bodies/fitness-body.tsx
import React from "react";

// Try legacy components first (silently optional)
let TrainingCenterCard: React.ComponentType | null = null;
let QuickActionsRow: React.ComponentType | null = null;
let FitnessDashboardLegacy: React.ComponentType | null = null;

try { TrainingCenterCard = require("@/features/health/fitness/components/TrainingCenterCard").default; } catch {}
try { QuickActionsRow     = require("@/features/health/fitness/components/QuickActionsRow").default; } catch {}
try { FitnessDashboardLegacy = require("@/features/health/fitness/FitnessDashboardLegacy").default; } catch {}

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
  // 1) If you still have a single old dashboard, render it verbatim
  if (FitnessDashboardLegacy) return <FitnessDashboardLegacy />;

  // 2) If both classic blocks exist, render them
  if (TrainingCenterCard && QuickActionsRow) {
    return (
      <>
        <TrainingCenterCard />
        <QuickActionsRow />
      </>
    );
  }

  // 3) If only Training Center exists, render it + our guaranteed Quick Actions
  if (TrainingCenterCard) {
    return (
      <>
        <TrainingCenterCard />
        <InlineQuickActions />
      </>
    );
  }

  // 4) Last resort: explain what's missing (visible, not silent)
  return (
    <div style={{ padding:16, border:"2px dashed #ff3b30", background:"#2b2b2b",
      borderRadius:12, color:"#ffd6d6" }}>
      <h3>Fitness body is wired, but legacy components weren't found.</h3>
      <p>Wire one of the following so the page matches the old look:</p>
      <ol>
        <li><code>features/health/fitness/FitnessDashboardLegacy.tsx</code> (single component)</li>
        <li><code>features/health/fitness/components/TrainingCenterCard.tsx</code> + <code>QuickActionsRow.tsx</code></li>
      </ol>
      <p>If paths differ, update the <code>require()</code> lines in this file to your exact files.</p>
    </div>
  );
}