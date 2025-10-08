import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const metrics = [
  { label: "Learning Time", value: "12.5h", subtext: "this week" },
  { label: "Goal Progress", value: "68%", subtext: "average" },
  { label: "Reflections", value: "14", subtext: "this month" },
];

export function PurposeMetrics() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Growth Metrics</h2>
        <Button variant="ghost" size="sm">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-4 rounded-lg border border-border/50 bg-background/50">
            <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
            <div className="text-lg font-semibold">{metric.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{metric.subtext}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
