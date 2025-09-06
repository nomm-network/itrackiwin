import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Target, Calendar, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTrainingPrograms, useCreateTrainingProgram, useSetActiveProgram, useNextProgramBlock } from '@/hooks/useTrainingPrograms';
import { useToast } from '@/hooks/use-toast';

export const TrainingProgramManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProgram, setNewProgram] = useState({
    name: '',
    goal: '',
  });

  const { data: programs = [], isLoading } = useTrainingPrograms();
  const { data: nextBlock } = useNextProgramBlock();
  const createProgram = useCreateTrainingProgram();
  const setActiveProgram = useSetActiveProgram();
  const { toast } = useToast();

  const handleCreateProgram = async () => {
    if (!newProgram.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a program name",
        variant: "destructive"
      });
      return;
    }

    try {
      await createProgram.mutateAsync({
        name: newProgram.name,
        goal: newProgram.goal || null,
        is_active: true
      });

      setNewProgram({ name: '', goal: '' });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Program created",
        description: `${newProgram.name} has been created successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create program",
        variant: "destructive"
      });
    }
  };

  const handleSetActive = async (programId: string, programName: string) => {
    try {
      await setActiveProgram.mutateAsync(programId);
      toast({
        title: "Program activated",
        description: `${programName} is now your active program`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set active program",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div>Loading training programs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Next Workout Card */}
      {nextBlock && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Next Workout</CardTitle>
            </div>
            <CardDescription>
              Your program suggests this workout next
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{nextBlock.template_name}</h3>
                <Badge variant="secondary">
                  {nextBlock.order_index} of {nextBlock.total_blocks}
                </Badge>
              </div>
              
              {nextBlock.focus_tags && nextBlock.focus_tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {nextBlock.focus_tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4" />
                  <span>Cycle {nextBlock.cycles_completed + 1}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => {
                  // This would integrate with the start workout flow
                  window.location.href = `/fitness/session/start?template=${nextBlock.workout_template_id}&block=${nextBlock.next_block_id}`;
                }}
              >
                Start This Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Programs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Training Programs</CardTitle>
              <CardDescription>
                Create and manage your workout program cycles
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Program
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Training Program</DialogTitle>
                  <DialogDescription>
                    Set up a new program that cycles through your workout templates
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="program-name">Program Name</Label>
                    <Input
                      id="program-name"
                      placeholder="e.g., Push/Pull/Legs"
                      value={newProgram.name}
                      onChange={(e) => setNewProgram(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="program-goal">Goal (Optional)</Label>
                    <Select 
                      value={newProgram.goal} 
                      onValueChange={(value) => setNewProgram(prev => ({ ...prev, goal: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="hypertrophy">Muscle Building</SelectItem>
                        <SelectItem value="endurance">Endurance</SelectItem>
                        <SelectItem value="general">General Fitness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProgram} disabled={createProgram.isPending}>
                      {createProgram.isPending ? 'Creating...' : 'Create Program'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {programs.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Programs Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first training program to get structured workout cycles
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Program
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {programs.map((program) => (
                <Card key={program.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{program.name}</CardTitle>
                      {program.goal && (
                        <Badge variant="secondary" className="text-xs">
                          {program.goal}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleSetActive(program.id, program.name)}
                      disabled={setActiveProgram.isPending}
                    >
                      {setActiveProgram.isPending ? 'Setting...' : 'Set as Active'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};