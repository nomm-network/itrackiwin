import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GoalsView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Set and track your personal development goals.</p>
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Learn React Native</div>
            <div className="text-sm text-muted-foreground">Due: Q2 2024 • 60% complete</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Read 24 Books</div>
            <div className="text-sm text-muted-foreground">Due: Dec 2024 • 18/24 complete</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Complete Marathon</div>
            <div className="text-sm text-muted-foreground">Due: Oct 2024 • Training phase</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}