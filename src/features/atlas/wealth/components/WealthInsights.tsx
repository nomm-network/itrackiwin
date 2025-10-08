import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function WealthInsights() {
  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-500/5 to-green-500/5 border-emerald-500/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Finance Coach</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You're trending +12% over budget — review where extra expenses came from this week.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Review Spending
            </Button>
            <Button size="sm" variant="ghost">
              Set Goal
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
