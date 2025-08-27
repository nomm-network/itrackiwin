import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useExerciseHandles, pickHandleName } from "@/hooks/useExerciseHandles";
import { useGrips } from "@/hooks/useGrips";

interface HandleGripSelectorProps {
  exerciseId?: string;
  selectedHandleId?: string;
  selectedGripIds?: string[];
  onHandleChange: (handleId: string) => void;
  onGripChange: (gripIds: string[]) => void;
  multiSelect?: boolean;
}

export function HandleGripSelector({
  exerciseId,
  selectedHandleId,
  selectedGripIds = [],
  onHandleChange,
  onGripChange,
  multiSelect = true
}: HandleGripSelectorProps) {
  const { data: exerciseHandles, isLoading: handlesLoading } = useExerciseHandles(exerciseId);
  const { data: allGrips, isLoading: gripsLoading } = useGrips();

  // For now, show all grips when a handle is selected
  // TODO: Implement handle-specific grip compatibility later

  const handleGripToggle = (gripId: string) => {
    if (multiSelect) {
      const isSelected = selectedGripIds.includes(gripId);
      if (isSelected) {
        onGripChange(selectedGripIds.filter(id => id !== gripId));
      } else {
        onGripChange([...selectedGripIds, gripId]);
      }
    } else {
      onGripChange([gripId]);
    }
  };

  if (handlesLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading handles...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Handle Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Handle/Attachment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exerciseHandles?.map((exerciseHandle) => (
              <Button
                key={exerciseHandle.handle_id}
                variant={selectedHandleId === exerciseHandle.handle_id ? "default" : "outline"}
                className="h-auto p-4 text-left flex-col items-start justify-start"
                onClick={() => onHandleChange(exerciseHandle.handle_id)}
              >
                <span className="font-semibold">{pickHandleName(exerciseHandle)}</span>
                {exerciseHandle.is_default && (
                  <span className="text-xs text-blue-600 mt-1">(recommended)</span>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grip Selection - Only show when handle is selected */}
      {selectedHandleId && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Grip Style</CardTitle>
          </CardHeader>
          <CardContent>
            {gripsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading compatible grips...</span>
              </div>
            ) : allGrips && allGrips.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allGrips.map((grip) => (
                  <Badge
                    key={grip.id}
                    variant={selectedGripIds.includes(grip.id) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-sm"
                    onClick={() => handleGripToggle(grip.id)}
                  >
                    {grip.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No grips available.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}