import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvestmentsView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Monitor your investment performance and allocation.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Total Portfolio</span>
            <span className="font-medium">$45,600</span>
          </div>
          <div className="flex justify-between items-center">
            <span>YTD Return</span>
            <span className="font-medium text-green-600">+12.4%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Monthly Contribution</span>
            <span className="font-medium">$800</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Risk Level</span>
            <span className="font-medium">Moderate</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}