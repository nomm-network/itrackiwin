import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NutritionBody() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Nutrition & hydration</CardTitle>
        <p className="text-sm text-muted-foreground">Under construction. Quick tips:</p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-1 text-sm list-decimal list-inside">
          <li>Log meals as you go; photos improve recall.</li>
          <li>Center meals on whole foods most of the time.</li>
          <li>Have protein at each meal to support satiety.</li>
          <li>Favor high-fiber carbs (beans, oats, fruit, veg).</li>
          <li>Use healthy fats (olive oil, nuts, fish).</li>
          <li>Hydrate regularly; watch sugary drinks.</li>
          <li>Plan ahead for travel/parties; pre-log intentions.</li>
          <li>Review weekly averages, not single days.</li>
          <li>Adjust one lever at a time (snacks/portions).</li>
          <li>Consistency beats perfection; trends &gt; snapshots.</li>
        </ol>
      </CardContent>
    </Card>
  );
}