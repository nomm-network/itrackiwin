import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const metrics = [
  { label: "Weekly Connections", value: "5", subtext: "calls & meetups" },
  { label: "Quality Time", value: "8.2h", subtext: "this week" },
  { label: "Appreciation Notes", value: "3", subtext: "sent this month" },
];

export function RelationshipMetrics() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Connection Metrics</h2>
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
