import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Play, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTemplateRotation } from '../hooks/useTemplateRotation.hook';
import { useStartWorkout } from '@/workouts-sot/hooks';
import { useNavigate } from 'react-router-dom';
import { Paths } from '@/app/router/paths';

const TemplateRotationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    activeTemplates, 
    isLoading, 
    reorderTemplates, 
    toggleTemplateActive,
    markAsNextTemplate 
  } = useTemplateRotation();
  const { mutateAsync: startWorkout, isPending: isGenerating } = useStartWorkout();

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(activeTemplates);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    try {
      await reorderTemplates(items);
      toast({ title: 'Template order updated' });
    } catch (error) {
      toast({ 
        title: 'Failed to reorder templates', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const handleQuickStart = async () => {
    try {
      const workout = await startWorkout({});
      toast({ title: 'Workout generated successfully!' });
      navigate(Paths.health.fitness.session(workout.workoutId));
    } catch (error) {
      toast({ 
        title: 'Failed to generate workout', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const formatLastDone = (lastDoneAt: string | null) => {
    if (!lastDoneAt) return 'Never';
    
    const date = new Date(lastDoneAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="p-4">Loading template rotation...</div>;
  }

  const nextTemplate = activeTemplates.find(t => t.is_active) || activeTemplates[0];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Template Rotation</h1>
        <p className="text-muted-foreground">
          Manage your workout template order and generate personalized sessions
        </p>
      </div>

      {nextTemplate && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <span className="text-lg">Up Next: {nextTemplate.template_name}</span>
                <Badge className="ml-2">Next in rotation</Badge>
              </div>
              <Button 
                onClick={handleQuickStart}
                disabled={isGenerating}
                size="lg"
                className="ml-4"
              >
                <Play className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Quick Start'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Last done: {formatLastDone(nextTemplate.last_done_at)}
              </div>
              {nextTemplate.notes && (
                <div>Notes: {nextTemplate.notes}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Template Order</CardTitle>
          <p className="text-sm text-muted-foreground">
            Drag to reorder templates. The least recently used active template will be suggested next.
          </p>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="templates">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {activeTemplates.map((template, index) => (
                    <Draggable 
                      key={template.id} 
                      draggableId={template.id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          } ${!template.is_active ? 'opacity-60' : ''}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                                </div>
                                
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{template.template_name}</span>
                                    <Badge variant="outline">{index + 1}</Badge>
                                    {!template.is_active && (
                                      <Badge variant="secondary">Inactive</Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Last done: {formatLastDone(template.last_done_at)}
                                  </div>
                                  {template.notes && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {template.notes}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsNextTemplate(template.id)}
                                  disabled={!template.is_active}
                                >
                                  Use Next
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTemplateActive(template.id)}
                                >
                                  {template.is_active ? (
                                    <ToggleRight className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                                  )}
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

          {activeTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No templates in rotation.</p>
              <p className="text-sm">Create some workout templates to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateRotationPage;