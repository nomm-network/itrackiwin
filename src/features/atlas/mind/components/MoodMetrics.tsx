import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const metrics = [
  { label: "Mood Avg", value: "7.5/10", trend: "up", change: "+5%" },
  { label: "Stress", value: "Low", trend: "down", change: "-12%" },
  { label: "Focus Time", value: "4.2h", trend: "neutral", change: "0%" },
];

export function MoodMetrics() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Mental Metrics</h2>
        <Button variant="ghost" size="sm">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-4 rounded-lg border border-border/50 bg-background/50">
            <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">{metric.value}</div>
              <div className={`flex items-center gap-1 text-xs ${
                metric.trend === 'up' ? 'text-green-500' : 
                metric.trend === 'down' ? 'text-red-500' : 
                'text-muted-foreground'
              }`}>
                {metric.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {metric.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {metric.trend === 'neutral' && <Minus className="w-3 h-3" />}
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
