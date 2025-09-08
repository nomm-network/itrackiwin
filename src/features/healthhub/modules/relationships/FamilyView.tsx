import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FamilyView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Family</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Keep track of family relationships and connections.</p>
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Mom & Dad</div>
            <div className="text-sm text-muted-foreground">Last call: Yesterday</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Sister Emma</div>
            <div className="text-sm text-muted-foreground">Last text: 3 days ago</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}