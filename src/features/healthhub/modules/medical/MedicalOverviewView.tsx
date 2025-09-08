import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MedicalOverviewView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Track your health records and appointments.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Next Checkup</span>
            <span className="font-medium">March 15, 2024</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Blood Pressure</span>
            <span className="font-medium">120/80</span>
          </div>
          <div className="flex justify-between items-center">
            <span>BMI</span>
            <span className="font-medium">23.5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}