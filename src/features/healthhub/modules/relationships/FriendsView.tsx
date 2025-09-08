import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FriendsView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Friends</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Manage your friendships and social connections.</p>
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Sarah Johnson</div>
            <div className="text-sm text-muted-foreground">Last contact: 2 days ago</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Mike Chen</div>
            <div className="text-sm text-muted-foreground">Last contact: 1 week ago</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}