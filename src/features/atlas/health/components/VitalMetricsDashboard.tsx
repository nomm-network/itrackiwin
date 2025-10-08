import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Scale, Moon, Brain, Heart } from "lucide-react";
import { MetricCard } from "./MetricCard";

export function VitalMetricsDashboard() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Vital Metrics</h2>
        <Button variant="ghost" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Metric
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          icon={<Scale className="w-5 h-5" />}
          title="Weight"
          value="--"
          unit="kg"
          trend={null}
          color="blue"
        />
        
        <MetricCard
          icon={<Moon className="w-5 h-5" />}
          title="Sleep Avg"
          value="--"
          unit="hrs"
          trend={null}
          color="indigo"
        />
        
        <MetricCard
          icon={<Brain className="w-5 h-5" />}
          title="Stress"
          value="--"
          unit=""
          trend={null}
          color="orange"
        />
        
        <MetricCard
          icon={<Heart className="w-5 h-5" />}
          title="Resting HR"
          value="--"
          unit="bpm"
          trend={null}
          color="red"
        />
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Start logging metrics to see your health trends
      </p>
    </Card>
  );
}
