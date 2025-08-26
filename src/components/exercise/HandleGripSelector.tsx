import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useHandles } from "@/hooks/useHandles";
import { useCompatibleGrips } from "@/hooks/useHandleGripCompatibility";

interface HandleGripSelectorProps {
  selectedHandleId?: string;
  selectedGripIds?: string[];
  onHandleChange: (handleId: string) => void;
  onGripChange: (gripIds: string[]) => void;
  multiSelect?: boolean;
}

export function HandleGripSelector({
  selectedHandleId,
  selectedGripIds = [],
  onHandleChange,
  onGripChange,
  multiSelect = true
}: HandleGripSelectorProps) {
  const { data: handles, isLoading: handlesLoading } = useHandles();
  const { data: compatibleGrips, isLoading: gripsLoading } = useCompatibleGrips(selectedHandleId);

  // Auto-select default grips when handle changes
  useEffect(() => {
    if (selectedHandleId && compatibleGrips && compatibleGrips.length > 0) {
      const defaultGrips = compatibleGrips.filter(grip => grip.is_default);
      if (defaultGrips.length > 0 && selectedGripIds.length === 0) {
        if (multiSelect) {
          onGripChange(defaultGrips.map(grip => grip.id));
        } else {
          onGripChange([defaultGrips[0].id]);
        }
      }
    }
  }, [selectedHandleId, compatibleGrips, selectedGripIds.length, multiSelect, onGripChange]);

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
            {handles?.map((handle) => (
              <Button
                key={handle.id}
                variant={selectedHandleId === handle.id ? "default" : "outline"}
                className="h-auto p-4 text-left flex-col items-start justify-start"
                onClick={() => onHandleChange(handle.id)}
              >
                <span className="font-semibold">{handle.name}</span>
                {handle.description && (
                  <span className="text-xs opacity-70 mt-1">{handle.description}</span>
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
            ) : compatibleGrips && compatibleGrips.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {compatibleGrips.map((grip) => (
                  <Badge
                    key={grip.id}
                    variant={selectedGripIds.includes(grip.id) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-sm"
                    onClick={() => handleGripToggle(grip.id)}
                  >
                    {grip.name}
                    {grip.is_default && (
                      <span className="ml-1 text-xs opacity-70">(recommended)</span>
                    )}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No compatible grips found for this handle.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}