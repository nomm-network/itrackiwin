import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfigureBody() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Configure</CardTitle>
        <p className="text-sm text-muted-foreground">Health hub settings (coming soon):</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm list-disc list-inside">
          <li>Choose default subcategory for this hub.</li>
          <li>Toggle which chips/tiles appear.</li>
          <li>Connect wearables & data sources.</li>
          <li>Notification preferences.</li>
          <li>Privacy & sharing options.</li>
        </ul>
      </CardContent>
    </Card>
  );
}