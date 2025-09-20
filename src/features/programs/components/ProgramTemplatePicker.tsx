import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, GripVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listProgramTemplates } from "../api/programs";
import { startFromTemplate } from "@/features/training/hooks/useLaunchers";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProgramTemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  programName: string;
}

export function ProgramTemplatePicker({ open, onOpenChange, programId, programName }: ProgramTemplatePickerProps) {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['program-templates', programId],
    queryFn: () => listProgramTemplates(programId),
    enabled: open && !!programId,
  });

  const handleStartTemplate = async (templateId: string, position: number) => {
    setIsStarting(true);
    try {
      // Navigate to readiness flow first - will start workout after readiness
      navigate(`/app/workouts/start/${templateId}`);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to start template:', error);
      toast.error('Failed to start template. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pick a Template</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choose any template from <strong>{programName}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No templates in this program
            </div>
          ) : (
            templates.map((template, index) => (
              <div
                key={template.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <Badge variant="outline" className="text-xs">
                    {template.order_index}
                  </Badge>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {template.workout_templates?.name || 'Unnamed Template'}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleStartTemplate(
                    template.workout_template_id, 
                    template.order_index
                  )}
                  disabled={isStarting}
                  className="shrink-0"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}