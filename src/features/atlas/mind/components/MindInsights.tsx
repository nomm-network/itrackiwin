import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function MindInsights() {
  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-purple-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Mind Coach Insight</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You've had high stress 3 days in a row — try a 10-min mindfulness break today.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Ask Coach
            </Button>
            <Button size="sm" variant="ghost">
              Start Breathing
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
