import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MindfulnessView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mindfulness Practice</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Track your meditation and mindfulness activities.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Meditation Streak</span>
            <span className="font-medium">12 days</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Minutes Today</span>
            <span className="font-medium">20 minutes</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Weekly Goal</span>
            <span className="font-medium">140/120 min</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Gratitude Entries</span>
            <span className="font-medium">5 this week</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}