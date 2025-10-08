import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smile, Brain, Activity } from "lucide-react";

export function TodayMindSnapshot() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <h2 className="text-lg font-semibold mb-4">Today's Mental State</h2>
      
      <div className="space-y-4">
        {/* Mood */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smile className="w-5 h-5 text-purple-500" />
            <span className="text-sm">Mood</span>
          </div>
          <span className="text-sm font-medium">Happy 😊</span>
        </div>

        {/* Stress Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-orange-500" />
            <span className="text-sm">Stress Level</span>
          </div>
          <span className="text-sm font-medium">Low</span>
        </div>

        {/* Focus */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-blue-500" />
            <span className="text-sm">Focus</span>
          </div>
          <span className="text-sm font-medium">8/10</span>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1" size="sm">
          Log Mood
        </Button>
        <Button variant="outline" className="flex-1" size="sm">
          View Trend
        </Button>
      </div>
    </Card>
  );
}
