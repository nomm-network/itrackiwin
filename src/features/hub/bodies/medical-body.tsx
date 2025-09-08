import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MedicalBody() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Medical check-ups</CardTitle>
        <p className="text-sm text-muted-foreground">Under construction. Quick tips:</p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-1 text-sm list-decimal list-inside">
          <li>Follow age-appropriate screening schedules.</li>
          <li>Keep vaccines/boosters up to date.</li>
          <li>Track family history and discuss risks.</li>
          <li>Monitor blood pressure, lipids, glucose as advised.</li>
          <li>Practice sun protection; do skin self-checks.</li>
          <li>Regular dental cleanings and eye exams.</li>
          <li>Maintain an accurate medication list.</li>
          <li>Prioritize sleep, activity, nutrition basics.</li>
          <li>Limit alcohol; avoid tobacco/nicotine.</li>
          <li>Seek care early for new or persistent symptoms.</li>
        </ol>
      </CardContent>
    </Card>
  );
}