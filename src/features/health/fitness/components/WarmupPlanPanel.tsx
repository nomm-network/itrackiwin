import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Edit2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildWarmupPlan } from "@/features/workouts/warmup/calcWarmup";
import type { WarmupPlan } from "@/features/workouts/types/warmup";

interface WarmupPlanPanelProps {
  exerciseId: string;
  exerciseName: string;
  targetWeight?: number;
  onWarmupPlanReady?: (planText: string) => void;
  className?: string;
}

const WarmupPlanPanel: React.FC<WarmupPlanPanelProps> = ({
  exerciseId,
  exerciseName,
  targetWeight,
  onWarmupPlanReady,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  
  // Simplified for now - would need full implementation
  const [warmupPlan, setWarmupPlan] = useState<any>(null);
  const isLoading = false;

  // Notify parent when plan is ready
  React.useEffect(() => {
    if (warmupPlan?.plan_text && onWarmupPlanReady) {
      onWarmupPlanReady(warmupPlan.plan_text);
    }
  }, [warmupPlan?.plan_text, onWarmupPlanReady]);

  const handleEdit = () => {
    setEditText(warmupPlan?.plan_text || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editText.trim()) {
      // For now, just update local state since the new warmup system
      // handles this automatically through the workout exercises
      setWarmupPlan({ plan_text: editText });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText("");
  };

  if (isLoading) {
    return (
      <Card className={cn("p-3", className)}>
        <div className="text-sm text-muted-foreground">Loading warmup plan...</div>
      </Card>
    );
  }

  const isExcellentStreak = (warmupPlan?.success_streak || 0) >= 3;

  return (
    <Card className={cn("p-3", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-0 h-auto font-normal"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Warm-up</span>
              {isExcellentStreak && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  ✓ Excellent
                </span>
              )}
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          {isExcellentStreak && !isOpen && (
            <div className="text-xs text-muted-foreground mb-2">
              Excellent last 3 times — tap to adjust
            </div>
          )}

          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Enter warmup plan..."
                className="font-mono text-sm min-h-[120px]"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleSave}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {warmupPlan?.plan_text ? (
                <pre className="text-xs font-mono whitespace-pre-wrap bg-muted/50 p-3 rounded">
                  {warmupPlan.plan_text}
                </pre>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No warmup plan yet. Add target weight to generate one.
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleEdit}
                  disabled={!warmupPlan?.plan_text}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                {warmupPlan?.source === 'auto' && (
                  <span className="text-xs text-muted-foreground self-center">
                    Auto-generated
                  </span>
                )}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default WarmupPlanPanel;