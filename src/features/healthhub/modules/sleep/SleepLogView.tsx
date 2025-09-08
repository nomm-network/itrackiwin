import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SleepLogView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep Log</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Log your bedtime and wake-up times.</p>
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Last Night</div>
            <div className="text-sm text-muted-foreground">Bed: 10:30 PM • Wake: 6:15 AM • 7h 45m</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Night Before</div>
            <div className="text-sm text-muted-foreground">Bed: 11:00 PM • Wake: 6:30 AM • 7h 30m</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}