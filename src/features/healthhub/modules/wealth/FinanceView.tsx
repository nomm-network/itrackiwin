import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinanceView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Track your income, expenses, and financial goals.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Monthly Income</span>
            <span className="font-medium">$5,200</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Monthly Expenses</span>
            <span className="font-medium">$3,800</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Savings Rate</span>
            <span className="font-medium">27%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Emergency Fund</span>
            <span className="font-medium">$12,000</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}