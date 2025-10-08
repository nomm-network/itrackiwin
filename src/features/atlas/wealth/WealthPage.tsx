import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { FinancialSnapshot } from "./components/FinancialSnapshot";
import { WealthMetrics } from "./components/WealthMetrics";
import { WealthInsights } from "./components/WealthInsights";
import { MoneyHabits } from "./components/MoneyHabits";
import { ConnectedPlanets } from "./components/ConnectedPlanets";
import { DollarSign } from "lucide-react";

export default function WealthPage() {
  const navigate = useNavigate();
  const financialScore = 78;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 p-4 pb-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Wealth</h1>
              <p className="text-sm text-muted-foreground">Financial health & abundance</p>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-500">
            {financialScore}/100
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        <FinancialSnapshot />
        <WealthMetrics />
        <WealthInsights />
        <MoneyHabits />
        <ConnectedPlanets />
      </div>
    </div>
  );
}
