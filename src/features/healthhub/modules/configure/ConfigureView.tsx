import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfigureView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Customize your health tracking preferences.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Profile Completion</span>
            <span className="font-medium">85%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Active Goals</span>
            <span className="font-medium">12/15</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Integrations</span>
            <span className="font-medium">3 connected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}