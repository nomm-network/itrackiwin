import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductivityView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productivity Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Track your productivity and time management.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Focus Time (Today)</span>
            <span className="font-medium">4h 20m</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Tasks Completed</span>
            <span className="font-medium">8/12</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Pomodoros</span>
            <span className="font-medium">6 sessions</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Weekly Goal</span>
            <span className="font-medium">72% complete</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}