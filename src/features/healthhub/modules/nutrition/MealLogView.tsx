import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MealLogView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meal Log</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Track your daily meals and nutrition intake.</p>
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Breakfast - 8:30 AM</div>
            <div className="text-sm text-muted-foreground">Oatmeal with berries - 350 calories</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Lunch - 12:45 PM</div>
            <div className="text-sm text-muted-foreground">Chicken salad - 450 calories</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}