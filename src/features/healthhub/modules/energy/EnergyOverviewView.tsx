import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EnergyOverviewView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Monitor your energy levels and patterns.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Current Energy</span>
            <span className="font-medium">7.5/10</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Focus Sessions</span>
            <span className="font-medium">3 today</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Mood</span>
            <span className="font-medium">Good</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}