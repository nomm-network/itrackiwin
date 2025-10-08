import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sunrise, Moon, Sparkles } from "lucide-react";

export function BalanceSnapshot() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <h2 className="text-lg font-semibold mb-4">Daily Balance</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sunrise className="w-5 h-5 text-amber-500" />
            <span className="text-sm">Morning Routine</span>
          </div>
          <span className="text-sm font-medium">Complete</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-sm">Screen Time</span>
          </div>
          <span className="text-sm font-medium">3.2h today</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-blue-500" />
            <span className="text-sm">Evening Calm</span>
          </div>
          <span className="text-sm font-medium">Pending</span>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1" size="sm">
          Start Routine
        </Button>
        <Button variant="outline" className="flex-1" size="sm">
          Reflect on Day
        </Button>
      </div>
    </Card>
  );
}
