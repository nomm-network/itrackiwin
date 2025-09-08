import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SleepBody() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Sleep quality</CardTitle>
        <p className="text-sm text-muted-foreground">Under construction. Quick tips:</p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-1 text-sm list-decimal list-inside">
          <li>Keep a consistent sleep/wake time daily.</li>
          <li>Build a 30–60 min wind-down (dim lights, no doomscroll).</li>
          <li>Cool, dark, quiet bedroom; comfy mattress/pillow.</li>
          <li>Limit caffeine after mid-afternoon; avoid late alcohol.</li>
          <li>Get morning daylight; move your body each day.</li>
          <li>Use bed for sleep/intimacy only.</li>
          <li>Can&apos;t sleep in ~20 min? Get up, relax, try again.</li>
          <li>Short naps (&lt;30 min) and earlier in the day.</li>
          <li>Track patterns; tweak one habit per week.</li>
          <li>See a clinician if snoring/apneas/excessive sleepiness.</li>
        </ol>
      </CardContent>
    </Card>
  );
}