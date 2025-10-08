import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function RelationshipInsights() {
  return (
    <Card className="p-6 bg-gradient-to-br from-pink-500/5 to-rose-500/5 border-pink-500/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-pink-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Connection Coach</h3>
          <p className="text-sm text-muted-foreground mb-4">
            It's been 10 days since you connected with family — small talk can recharge you.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Schedule Call
            </Button>
            <Button size="sm" variant="ghost">
              Log Gratitude
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
