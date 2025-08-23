import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRecalibration } from "../hooks/useRecalibration.hook";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RecalibrationPanelProps {
  exerciseId: string;
  exerciseName: string;
  onApplyPrescription?: (prescription: any) => void;
}

export const RecalibrationPanel = ({ 
  exerciseId, 
  exerciseName, 
  onApplyPrescription 
}: RecalibrationPanelProps) => {
  const { data: prescription, isLoading, error } = useRecalibration(exerciseId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Analyzing your training data...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load recommendations</p>
        </CardContent>
      </Card>
    );
  }

  if (!prescription) return null;

  const getProgressionIcon = () => {
    if (prescription.progression_factor > 1.01) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (prescription.progression_factor < 0.99) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const getProgressionColor = () => {
    if (prescription.progression_factor > 1.01) return "text-green-600";
    if (prescription.progression_factor < 0.99) return "text-red-600";
    return "text-yellow-600";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Smart Prescription: {exerciseName}</span>
          <div className="flex items-center gap-2">
            {getProgressionIcon()}
            <span className={`text-sm font-medium ${getProgressionColor()}`}>
              {((prescription.progression_factor - 1) * 100).toFixed(1)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Warmup Section */}
        <div>
          <h4 className="font-medium mb-2">Warmup</h4>
          <div className="bg-muted p-3 rounded-md">
            <code className="text-sm">{prescription.warmup_text}</code>
          </div>
        </div>

        {/* Working Sets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Top Set</h4>
            <div className="bg-primary/10 p-3 rounded-md">
              <p className="font-semibold">
                {prescription.top_set.weight}kg × {prescription.top_set.reps}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Backoff Sets</h4>
            <div className="bg-secondary/50 p-3 rounded-md">
              <p className="font-semibold">
                {prescription.backoff.sets} × {prescription.backoff.weight}kg × {prescription.backoff.reps}
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="space-y-2">
          <h4 className="font-medium">Analysis</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Priority: {prescription.muscle_priority}/5
            </Badge>
            <Badge variant="outline">
              Consistency: {prescription.consistency_score?.toFixed(1)}
            </Badge>
            {prescription.analysis.avg_rpe && (
              <Badge variant="outline">
                Avg RPE: {prescription.analysis.avg_rpe.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>

        {/* Notes */}
        {prescription.notes.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {prescription.notes.map((note, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Action Button */}
        {onApplyPrescription && (
          <Button 
            onClick={() => onApplyPrescription(prescription)}
            className="w-full"
          >
            Apply This Prescription
          </Button>
        )}
      </CardContent>
    </Card>
  );
};