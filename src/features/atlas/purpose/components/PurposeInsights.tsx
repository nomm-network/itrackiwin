import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function PurposeInsights() {
  return (
    <Card className="p-6 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Growth Coach</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You've been consistent with reflection — maybe set one growth experiment for next week?
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Plan Experiment
            </Button>
            <Button size="sm" variant="ghost">
              Visualize Future
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
