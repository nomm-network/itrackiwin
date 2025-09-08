import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HabitsView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Habits</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Track your daily habits and routines.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Morning Routine</span>
            <span className="font-medium">21-day streak</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Daily Exercise</span>
            <span className="font-medium">14-day streak</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Reading</span>
            <span className="font-medium">7-day streak</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Meditation</span>
            <span className="font-medium">3-day streak</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}