import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, TrendingUp, BookOpen } from "lucide-react";

export function GrowthSnapshot() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <h2 className="text-lg font-semibold mb-4">Growth Status</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-amber-500" />
            <span className="text-sm">Purpose Clarity</span>
          </div>
          <span className="text-sm font-medium">Strong</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm">Goals in Progress</span>
          </div>
          <span className="text-sm font-medium">3 active</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span className="text-sm">Reflection Streak</span>
          </div>
          <span className="text-sm font-medium">7 days</span>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1" size="sm">
          Reflect
        </Button>
        <Button variant="outline" className="flex-1" size="sm">
          Add Goal
        </Button>
      </div>
    </Card>
  );
}
