import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FitnessTrainingView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Center</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Start your workout or view your training progress.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Current Program</span>
            <span className="font-medium">Push/Pull/Legs</span>
          </div>
          <div className="flex justify-between items-center">
            <span>This Week</span>
            <span className="font-medium">3/4 workouts</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Last Workout</span>
            <span className="font-medium">2 days ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}