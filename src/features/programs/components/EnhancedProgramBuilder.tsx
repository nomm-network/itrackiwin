import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Plus, X, Play } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateTrainingProgram, useAddProgramBlock, useSetActiveProgram } from "@/hooks/useTrainingPrograms";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  notes?: string;
  exercise_count?: number;
}

interface ProgramBlock {
  id: string;
  template_id: string;
  order_index: number;
  template: Template;
}

interface EnhancedProgramBuilderProps {
  onProgramCreated?: (programId: string) => void;
}

export function EnhancedProgramBuilder({ onProgramCreated }: EnhancedProgramBuilderProps) {
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([]);
  const [createdProgramId, setCreatedProgramId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch available templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['workout-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          id,
          name,
          notes,
          template_exercises(count)
        `)
        .order('name');
      
      if (error) throw error;
      
      return data.map(t => ({
        ...t,
        exercise_count: t.template_exercises?.[0]?.count || 0
      }));
    }
  });

  const createProgram = useCreateTrainingProgram();
  const addBlock = useAddProgramBlock();
  const setActiveProgram = useSetActiveProgram();

  const handleCreateProgram = async () => {
    if (!programName.trim()) {
      toast.error('Program name is required');
      return;
    }

    try {
      const program = await createProgram.mutateAsync({
        name: programName,
        is_active: true
      });

      setCreatedProgramId(program.id);

      // Add all selected templates as blocks
      for (let i = 0; i < selectedTemplates.length; i++) {
        await addBlock.mutateAsync({
          program_id: program.id,
          workout_template_id: selectedTemplates[i].id,
          order_index: i + 1
        });
      }

      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['ai-programs'] });
      
      toast.success('Training program created successfully!');
      onProgramCreated?.(program.id);
    } catch (error) {
      console.error('Failed to create program:', error);
      toast.error('Failed to create training program');
    }
  };

  const handleActivateProgram = async () => {
    if (!createdProgramId) return;

    try {
      await setActiveProgram.mutateAsync(createdProgramId);
      toast.success('Program activated! Ready for your first workout.');
    } catch (error) {
      console.error('Failed to activate program:', error);
      toast.error('Failed to activate program');
    }
  };

  const addTemplate = (template: Template) => {
    if (!selectedTemplates.find(t => t.id === template.id)) {
      setSelectedTemplates([...selectedTemplates, template]);
    }
  };

  const removeTemplate = (templateId: string) => {
    setSelectedTemplates(selectedTemplates.filter(t => t.id !== templateId));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedTemplates = Array.from(selectedTemplates);
    const [removed] = reorderedTemplates.splice(result.source.index, 1);
    reorderedTemplates.splice(result.destination.index, 0, removed);

    setSelectedTemplates(reorderedTemplates);
  };

  if (createdProgramId) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-green-600">Program Created! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Your <strong>{programName}</strong> program is ready with {selectedTemplates.length} workout blocks.
          </p>
          
          <Button 
            onClick={handleActivateProgram}
            disabled={setActiveProgram.isPending}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {setActiveProgram.isPending ? 'Activating...' : 'Activate Program & Start Training'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setCreatedProgramId(null);
              setProgramName('');
              setProgramDescription('');
              setSelectedTemplates([]);
            }}
            className="w-full"
          >
            Create Another Program
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Program Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Create Training Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="program-name">Program Name</Label>
            <Input
              id="program-name"
              placeholder="e.g., Push/Pull/Legs"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="program-description">Description (Optional)</Label>
            <Input
              id="program-description"
              placeholder="Brief description of your program"
              value={programDescription}
              onChange={(e) => setProgramDescription(e.target.value)}
            />
          </div>

          {/* Selected Templates */}
          <div>
            <Label>Program Structure ({selectedTemplates.length} workouts)</Label>
            {selectedTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed rounded">
                Add templates from the right to build your program
              </p>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="program-blocks">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2 mt-2"
                    >
                      {selectedTemplates.map((template, index) => (
                        <Draggable key={template.id} draggableId={template.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center gap-2 p-2 border rounded bg-card"
                            >
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              
                              <Badge variant="outline" className="text-xs">
                                Day {index + 1}
                              </Badge>
                              
                              <span className="flex-1 text-sm font-medium">
                                {template.name}
                              </span>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTemplate(template.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
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

          <Button 
            onClick={handleCreateProgram}
            disabled={!programName.trim() || selectedTemplates.length === 0 || createProgram.isPending}
            className="w-full"
          >
            {createProgram.isPending ? 'Creating...' : `Create Program (${selectedTemplates.length} workouts)`}
          </Button>
        </CardContent>
      </Card>

      {/* Available Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {templatesLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : templates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No templates found. Create some workout templates first.
              </p>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <Card key={template.id} className="p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        {template.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{template.notes}</p>
                        )}
                        <Badge variant="secondary" className="text-xs mt-1">
                          {template.exercise_count} exercises
                        </Badge>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addTemplate(template)}
                        disabled={selectedTemplates.some(t => t.id === template.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}