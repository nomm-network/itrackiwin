import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MacroStatsView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Macro Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">View your macronutrient breakdown and targets.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Protein</span>
            <span className="font-medium">125g / 140g</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Carbs</span>
            <span className="font-medium">180g / 200g</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Fat</span>
            <span className="font-medium">65g / 70g</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}