import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoveView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Love</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Nurture your romantic relationships.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Quality Time</span>
            <span className="font-medium">3h this week</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Date Night</span>
            <span className="font-medium">Friday planned</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Connection Score</span>
            <span className="font-medium">8.5/10</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}