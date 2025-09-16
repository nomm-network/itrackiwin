import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, Play, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProgramEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: any;
}

export function ProgramEditDialog({ open, onOpenChange, program }: ProgramEditDialogProps) {
  const [programName, setProgramName] = useState(program?.name || '');
  const [programGoal, setProgramGoal] = useState(program?.goal || '');
  const queryClient = useQueryClient();

  // Update state when program prop changes
  React.useEffect(() => {
    if (program) {
      setProgramName(program.name || '');
      setProgramGoal(program.goal || '');
    }
  }, [program]);

  // Fetch program templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['program-templates', program?.id],
    queryFn: async () => {
      if (!program?.id) return [];
      
      const { data, error } = await supabase
        .from('training_program_blocks')
        .select(`
          id,
          order_index,
          workout_template_id,
          workout_templates:workout_template_id (
            id,
            name
          )
        `)
        .eq('program_id', program.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: open && !!program?.id,
  });

  // Update program mutation
  const updateProgram = useMutation({
    mutationFn: async (updates: { name?: string; goal?: string }) => {
      const { error } = await supabase
        .from('training_programs')
        .update(updates)
        .eq('id', program.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      toast.success('Program updated successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Failed to update program:', error);
      toast.error('Failed to update program');
    }
  });

  // Reorder templates mutation
  const reorderTemplates = useMutation({
    mutationFn: async (reorderedTemplates: any[]) => {
      console.log('Reordering templates:', reorderedTemplates);
      
      // First, set all order_index to negative values to avoid unique constraint violations
      const tempUpdates = reorderedTemplates.map((template, index) => ({
        id: template.id,
        temp_order: -(index + 1)
      }));

      console.log('Temp updates to apply:', tempUpdates);

      // Step 1: Set temporary negative order_index values
      for (const update of tempUpdates) {
        const { error } = await supabase
          .from('training_program_blocks')
          .update({ order_index: update.temp_order })
          .eq('id', update.id);
        
        if (error) {
          console.error('Failed to update template (temp):', update, error);
          throw new Error(`Failed to update template (temp): ${error.message}`);
        }
      }

      // Step 2: Set final positive order_index values
      const finalUpdates = reorderedTemplates.map((template, index) => ({
        id: template.id,
        order_index: index + 1
      }));

      console.log('Final updates to apply:', finalUpdates);

      for (const update of finalUpdates) {
        const { error } = await supabase
          .from('training_program_blocks')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
        
        if (error) {
          console.error('Failed to update template (final):', update, error);
          throw new Error(`Failed to update template (final): ${error.message}`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-templates', program?.id] });
      toast.success('Template order updated');
    },
    onError: (error) => {
      console.error('Failed to reorder templates:', error);
      toast.error(`Failed to reorder templates: ${error.message}`);
    }
  });

  // Remove template mutation
  const removeTemplate = useMutation({
    mutationFn: async (templateBlockId: string) => {
      const { error } = await supabase
        .from('training_program_blocks')
        .delete()
        .eq('id', templateBlockId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-templates', program?.id] });
      toast.success('Template removed from program');
    },
    onError: (error) => {
      console.error('Failed to remove template:', error);
      toast.error('Failed to remove template');
    }
  });

  const handleSave = () => {
    if (!programName.trim()) {
      toast.error('Program name is required');
      return;
    }

    updateProgram.mutate({
      name: programName,
      goal: programGoal || null
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(templates);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderTemplates.mutate(items);
  };

  const handleRemoveTemplate = (templateBlockId: string, templateName: string) => {
    if (confirm(`Remove "${templateName}" from this program?`)) {
      removeTemplate.mutate(templateBlockId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
          <DialogDescription>
            Update your training program details and reorder templates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Program Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="program-name">Program Name</Label>
              <Input
                id="program-name"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="e.g., Push/Pull/Legs"
              />
            </div>

            <div>
              <Label htmlFor="program-goal">Goal</Label>
              <Select value={programGoal} onValueChange={setProgramGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="hypertrophy">Muscle Building</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="general_fitness">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Templates List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Templates Order</Label>
              <Badge variant="outline" className="text-xs">
                {templates.length} template{templates.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : templates.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No templates in this program</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add templates to create your program structure
                  </p>
                </CardContent>
              </Card>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="templates">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {templates.map((template, index) => (
                        <Draggable key={template.id} draggableId={template.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-5 w-5" />
                                  </div>

                                  <Badge variant="outline" className="text-xs shrink-0">
                                    {index + 1}
                                  </Badge>

                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {template.workout_templates?.name || 'Unnamed Template'}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0"
                                      title="Start this template"
                                    >
                                      <Play className="h-3 w-3" />
                                    </Button>
                                    
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                      onClick={() => handleRemoveTemplate(
                                        template.id,
                                        template.workout_templates?.name || 'Template'
                                      )}
                                      title="Remove from program"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updateProgram.isPending || !programName.trim()}
            >
              {updateProgram.isPending ? 'Saving...' : 'Update Program'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}