import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function LifestyleInsights() {
  return (
    <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Lifestyle Coach</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your evenings show stress spikes — try winding down earlier tonight.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Set Evening Mood
            </Button>
            <Button size="sm" variant="ghost">
              Limit Screens
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
