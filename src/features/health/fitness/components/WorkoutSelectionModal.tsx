import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Users, FileText, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrainingPrograms, useNextProgramBlock, useSetActiveProgram } from '@/hooks/useTrainingPrograms';
import { useTemplates } from '../services/fitness.api';
import { useStartWorkout } from '../workouts/hooks';
import { toast } from 'sonner';

interface WorkoutSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkoutSelectionModal: React.FC<WorkoutSelectionModalProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('programs');
  const { data: programs = [] } = useTrainingPrograms();
  const { data: templates = [] } = useTemplates();
  const { data: nextBlock } = useNextProgramBlock();
  const setActiveProgram = useSetActiveProgram();
  const startWorkout = useStartWorkout();

  const handleProgramSelect = async (programId: string) => {
    try {
      await setActiveProgram.mutateAsync(programId);
      toast.success('Program activated successfully');
      onOpenChange(false);
      // If there's already a next block, start it
      if (nextBlock?.workout_template_id) {
        navigate(`/app/workouts/start-quick?templateId=${nextBlock.workout_template_id}`);
      }
    } catch (error) {
      toast.error('Failed to activate program');
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    console.log('🎯 WorkoutSelectionModal - handleTemplateSelect called with templateId:', templateId);
    console.log('🎯 WorkoutSelectionModal - About to navigate to start-quick page');
    onOpenChange(false);
    navigate(`/app/workouts/start-quick?templateId=${templateId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Start Your Workout
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Programs
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {nextBlock && (
                <Card className="mb-4 border-primary/50 bg-primary/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Continue Current Program
                      </CardTitle>
                      <Badge variant="default" className="bg-green-500">Ready</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{nextBlock.template_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Block {nextBlock.order_index + 1} of {nextBlock.total_blocks} • Cycle {nextBlock.cycles_completed + 1}
                      </p>
                      <Button 
                        onClick={() => handleTemplateSelect(nextBlock.workout_template_id)}
                        className="w-full mt-2"
                        disabled={startWorkout.isPending}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {startWorkout.isPending ? 'Starting...' : 'Continue Program'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Available Programs</h4>
                {programs.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No programs created yet</p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          onOpenChange(false);
                          navigate('/app/programs');
                        }}
                        className="mt-2"
                      >
                        Create Program
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  programs.map((program) => (
                    <Card key={program.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{program.name}</h3>
                            <p className="text-sm text-muted-foreground">{program.goal}</p>
                          </div>
                          <Button 
                            onClick={() => handleProgramSelect(program.id)}
                            disabled={setActiveProgram.isPending}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {setActiveProgram.isPending ? 'Activating...' : 'Activate'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Quick Start Templates</h4>
                {templates.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No templates available</p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          onOpenChange(false);
                          navigate('/fitness/templates');
                        }}
                        className="mt-2"
                      >
                        Browse Templates
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  templates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            {template.notes && (
                              <p className="text-sm text-muted-foreground">{template.notes}</p>
                            )}
                            {template.notes && (
                              <div className="flex gap-1 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  Notes available
                                </Badge>
                              </div>
                            )}
                          </div>
                          <Button onClick={() => {
                            console.log('🎯 Template Start button clicked for template:', template);
                            handleTemplateSelect(template.id);
                          }}>
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutSelectionModal;