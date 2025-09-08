import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SleepOverviewView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Track your sleep patterns and quality.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Last Night</span>
            <span className="font-medium">7h 45m</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Sleep Quality</span>
            <span className="font-medium">Good</span>
          </div>
          <div className="flex justify-between items-center">
            <span>REM Sleep</span>
            <span className="font-medium">1h 52m</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}