import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CareerView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Development</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Track your professional growth and career goals.</p>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Current Role</span>
            <span className="font-medium">Senior Developer</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Years Experience</span>
            <span className="font-medium">5 years</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Skills Completed</span>
            <span className="font-medium">12/15</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Next Review</span>
            <span className="font-medium">March 2024</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}