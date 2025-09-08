import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function KnowledgeView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Base</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Organize and track your learning resources.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Books Read (YTD)</span>
            <span className="font-medium">18/24</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Courses Completed</span>
            <span className="font-medium">3 this quarter</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Learning Streak</span>
            <span className="font-medium">14 days</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Notes Created</span>
            <span className="font-medium">47 this month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}