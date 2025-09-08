import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SkillsView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Development</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Track your learning progress and skill development.</p>
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">JavaScript Advanced</div>
            <div className="text-sm text-muted-foreground">75% complete • 4 weeks remaining</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Data Structures</div>
            <div className="text-sm text-muted-foreground">45% complete • 6 weeks remaining</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">System Design</div>
            <div className="text-sm text-muted-foreground">Starting next month</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}