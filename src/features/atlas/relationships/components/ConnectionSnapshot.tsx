import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Calendar } from "lucide-react";

export function ConnectionSnapshot() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-pink-500" />
            <span className="text-sm">Social Energy</span>
          </div>
          <span className="text-sm font-medium">Balanced</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <span className="text-sm">Last Connection</span>
          </div>
          <span className="text-sm font-medium">2 days ago</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-500" />
            <span className="text-sm">Upcoming</span>
          </div>
          <span className="text-sm font-medium">Dinner, Friday</span>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1" size="sm">
          Reach Out
        </Button>
        <Button variant="outline" className="flex-1" size="sm">
          Plan Time
        </Button>
      </div>
    </Card>
  );
}
