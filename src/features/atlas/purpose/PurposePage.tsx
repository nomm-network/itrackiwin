import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { GrowthSnapshot } from "./components/GrowthSnapshot";
import { PurposeMetrics } from "./components/PurposeMetrics";
import { PurposeInsights } from "./components/PurposeInsights";
import { GrowthHabits } from "./components/GrowthHabits";
import { ConnectedPlanets } from "./components/ConnectedPlanets";
import { Target } from "lucide-react";

export default function PurposePage() {
  const navigate = useNavigate();
  const purposeScore = 88;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 p-4 pb-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Purpose</h1>
              <p className="text-sm text-muted-foreground">Personal growth & meaning</p>
            </div>
          </div>
          <Badge variant="outline" className="text-amber-500">
            {purposeScore}/100
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        <GrowthSnapshot />
        <PurposeMetrics />
        <PurposeInsights />
        <GrowthHabits />
        <ConnectedPlanets />
      </div>
    </div>
  );
}
