import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BalanceSnapshot } from "./components/BalanceSnapshot";
import { LifestyleMetrics } from "./components/LifestyleMetrics";
import { LifestyleInsights } from "./components/LifestyleInsights";
import { LifestyleHabits } from "./components/LifestyleHabits";
import { ConnectedPlanets } from "./components/ConnectedPlanets";
import { Moon } from "lucide-react";

export default function LifestylePage() {
  const navigate = useNavigate();
  const balanceScore = 79;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 p-4 pb-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Moon className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Lifestyle</h1>
              <p className="text-sm text-muted-foreground">Daily routines & environment</p>
            </div>
          </div>
          <Badge variant="outline" className="text-blue-500">
            {balanceScore}/100
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        <BalanceSnapshot />
        <LifestyleMetrics />
        <LifestyleInsights />
        <LifestyleHabits />
        <ConnectedPlanets />
      </div>
    </div>
  );
}
