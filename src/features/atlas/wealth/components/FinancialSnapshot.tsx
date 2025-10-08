import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, PiggyBank, CreditCard } from "lucide-react";

export function FinancialSnapshot() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className="text-sm">Budget Status</span>
          </div>
          <span className="text-sm font-medium">85% used</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PiggyBank className="w-5 h-5 text-blue-500" />
            <span className="text-sm">Savings Goal</span>
          </div>
          <span className="text-sm font-medium">62% complete</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-purple-500" />
            <span className="text-sm">Financial Feeling</span>
          </div>
          <span className="text-sm font-medium">Secure</span>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1" size="sm">
          Add Transaction
        </Button>
        <Button variant="outline" className="flex-1" size="sm">
          View Flow
        </Button>
      </div>
    </Card>
  );
}
