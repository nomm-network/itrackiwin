import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Target, Calendar } from "lucide-react";

export default function TrainingCenterCard() {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Training Center
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
            <Target className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold">Start Workout</h3>
            <p className="text-sm text-muted-foreground">Begin training session</p>
          </div>
          <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
            <Calendar className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold">View Schedule</h3>
            <p className="text-sm text-muted-foreground">Check your program</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}