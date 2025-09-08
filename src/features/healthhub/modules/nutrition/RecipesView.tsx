import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecipesView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recipes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Discover healthy recipes that match your goals.</p>
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">High-Protein Quinoa Bowl</div>
            <div className="text-sm text-muted-foreground">30g protein • 420 calories • 25 min</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Mediterranean Chicken</div>
            <div className="text-sm text-muted-foreground">35g protein • 380 calories • 30 min</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}