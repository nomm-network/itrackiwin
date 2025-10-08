import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, Info } from "lucide-react";

export function SmartInsights() {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Health Coach Insight</h3>
          <p className="text-sm text-muted-foreground">
            Start logging your daily readiness to receive personalized health insights and recommendations.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="default" size="sm">
          <MessageCircle className="w-4 h-4 mr-1" />
          Ask My Coach
        </Button>
        <Button variant="ghost" size="sm">
          <Info className="w-4 h-4 mr-1" />
          Learn More
        </Button>
      </div>
    </Card>
  );
}
