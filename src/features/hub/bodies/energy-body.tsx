import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EnergyBody() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Energy levels</CardTitle>
        <p className="text-sm text-muted-foreground">Under construction. Quick tips:</p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-1 text-sm list-decimal list-inside">
          <li>Anchor sleep and wake times; protect 7–9 hours.</li>
          <li>Protein + fiber at meals; steady hydration.</li>
          <li>Micro-movement breaks (2–5 min) each hour.</li>
          <li>Morning light exposure; brief outdoor time.</li>
          <li>Time caffeine early; avoid late-day use.</li>
          <li>Batch deep work in your natural energy peaks.</li>
          <li>Use short resets (breathing/steps/stretch) under stress.</li>
          <li>Limit alcohol on weekdays; monitor its next-day impact.</li>
          <li>Track energy vs. sleep, food, stress, movement.</li>
          <li>Check labs with your clinician if fatigue persists.</li>
        </ol>
      </CardContent>
    </Card>
  );
}