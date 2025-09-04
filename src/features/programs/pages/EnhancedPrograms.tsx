import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Settings, Plus, Trash2, Edit } from 'lucide-react';
import { EnhancedProgramBuilder } from '../components/EnhancedProgramBuilder';
import { useTrainingPrograms, useSetActiveProgram, useNextProgramBlock, useDeleteTrainingProgram, useUpdateTrainingProgram } from '@/hooks/useTrainingPrograms';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useStartWorkout } from '@/features/health/fitness/workouts/hooks';

export default function EnhancedPrograms() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', goal: '' });
  const { data: programs = [], isLoading } = useTrainingPrograms();
  const { data: nextBlock } = useNextProgramBlock();
  const setActiveProgram = useSetActiveProgram();
  const deleteProgram = useDeleteTrainingProgram();
  const updateProgram = useUpdateTrainingProgram();
  const startWorkout = useStartWorkout();

  const handleActivateProgram = async (programId: string) => {
    try {
      await setActiveProgram.mutateAsync(programId);
      toast.success('Program activated successfully');
    } catch (error) {
      console.error('Failed to activate program:', error);
      toast.error('Failed to activate program');
    }
  };

  const handleDeleteProgram = async (programId: string, programName: string) => {
    if (!confirm(`Are you sure you want to delete "${programName}"?`)) return;
    
    try {
      await deleteProgram.mutateAsync(programId);
      toast.success('Program deleted successfully');
    } catch (error) {
      console.error('Failed to delete program:', error);
      toast.error('Failed to delete program');
    }
  };

  const handleEditProgram = (program: any) => {
    setEditingProgram(program);
    setEditForm({ name: program.name, goal: program.goal || '' });
  };

  const handleUpdateProgram = async () => {
    if (!editForm.name.trim()) {
      toast.error('Program name is required');
      return;
    }

    try {
      await updateProgram.mutateAsync({
        programId: editingProgram.id,
        updates: {
          name: editForm.name,
          goal: editForm.goal === 'none' ? null : editForm.goal
        }
      });
      toast.success('Program updated successfully');
      setEditingProgram(null);
    } catch (error) {
      console.error('Failed to update program:', error);
      toast.error('Failed to update program');
    }
  };

  const handleStartWorkout = async () => {
    if (!nextBlock) return;
    
    try {
      const result = await startWorkout.mutateAsync({ 
        templateId: nextBlock.workout_template_id
      });
      
      // Navigate to workout session
      window.location.href = `/fitness/session/${result.workoutId}`;
    } catch (error) {
      console.error('Failed to start workout:', error);
      toast.error('Could not start workout. Please try again.');
    }
  };

  if (showBuilder) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowBuilder(false)}
            className="mb-4"
          >
            ← Back to Programs
          </Button>
        </div>
        
        <EnhancedProgramBuilder 
          onProgramCreated={() => setShowBuilder(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Training Programs</h1>
          <p className="text-muted-foreground">
            Create and manage circular workout programs
          </p>
        </div>
        
        <Button onClick={() => setShowBuilder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Program
        </Button>
      </div>

      {/* Next Workout */}
      {nextBlock && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Play className="h-5 w-5" />
              Next Workout Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{nextBlock.template_name}</p>
                <p className="text-sm text-muted-foreground">
                  Block {nextBlock.order_index + 1} of {nextBlock.total_blocks} • Cycle {nextBlock.cycles_completed + 1}
                </p>
              </div>
              
              <Button onClick={handleStartWorkout} disabled={startWorkout.isPending}>
                {startWorkout.isPending ? 'Starting...' : 'Start Workout'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Programs */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Programs</h2>
        
        {isLoading ? (
          <div className="grid gap-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : programs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                No training programs yet. Create your first program to get started!
              </p>
              <Button onClick={() => setShowBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Program
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {programs.map((program) => (
              <Card key={program.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                      {program.goal && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {program.goal}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {program.is_active && (
                        <Badge variant="default">Active</Badge>
                      )}
                      <Badge variant="outline">
                        Program
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(program.created_at).toLocaleDateString()}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditProgram(program)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteProgram(program.id, program.name)}
                        disabled={deleteProgram.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                      
                      {!program.is_active && (
                        <Button 
                          size="sm"
                          onClick={() => handleActivateProgram(program.id)}
                          disabled={setActiveProgram.isPending}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Program Dialog */}
      <Dialog open={!!editingProgram} onOpenChange={(open) => !open && setEditingProgram(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogDescription>
              Update your training program details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Program Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-goal">Goal</Label>
              <Select 
                value={editForm.goal} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, goal: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No goal</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="hypertrophy">Muscle Building</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="general">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditingProgram(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProgram} disabled={updateProgram.isPending}>
                {updateProgram.isPending ? 'Updating...' : 'Update Program'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}