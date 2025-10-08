import React, { useState } from 'react';
import { Brain, User, Plus, Edit, Trash2 } from 'lucide-react';
import { ProgramBuilderForm, useAIPrograms } from '@/features/ai-coach';
import { EnhancedProgramBuilder } from './EnhancedProgramBuilder';
import { ProgramEditDialog } from './ProgramEditDialog';
import { useTrainingPrograms, useDeleteTrainingProgram, useSetActiveProgram } from '@/hooks/useTrainingPrograms';
import { useDeleteProgramWithTemplates } from '@/hooks/useDeleteProgramWithTemplates';
import { useCleanupOrphanedTemplates } from '@/hooks/useCleanupOrphanedTemplates';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DebugPanel } from '@/components/debug/DebugPanel';
import { EdgeFunctionDebugPanel } from '@/components/debug/EdgeFunctionDebugPanel';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ProgramTabs() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderType, setBuilderType] = useState<'ai' | 'manual'>('manual');
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<{ id: string; isAi: boolean } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<any>(null);
  
  const { data: aiPrograms = [], isLoading: aiLoading } = useAIPrograms();
  const { data: manualPrograms = [], isLoading: manualLoading } = useTrainingPrograms();
  const deleteProgram = useDeleteTrainingProgram();
  const deleteProgramWithTemplates = useDeleteProgramWithTemplates();
  const cleanupOrphaned = useCleanupOrphanedTemplates();
  const setActiveProgram = useSetActiveProgram();
  const { isAdmin } = useIsAdmin();
  const { toast } = useToast();

  // Combine all programs - AI programs have ai_generated field, manual programs don't
  const allPrograms = [
    ...aiPrograms,
    ...manualPrograms
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleDeleteClick = (programId: string, isAiGenerated: boolean) => {
    setProgramToDelete({ id: programId, isAi: isAiGenerated });
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (program: any) => {
    setProgramToEdit(program);
    setEditDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!programToDelete) return;

    try {
      // For AI programs, use the function that also cleans up orphaned templates
      // For manual programs, use standard deletion
      if (programToDelete.isAi) {
        await deleteProgramWithTemplates.mutateAsync(programToDelete.id);
      } else {
        await deleteProgram.mutateAsync(programToDelete.id);
      }
    } catch (error) {
      // Error handling is done in the hooks
    } finally {
      setDeleteDialogOpen(false);
      setProgramToDelete(null);
    }
  };

  const handleCleanupOrphaned = async () => {
    if (window.confirm('This will delete all workout templates that are not linked to any program. Continue?')) {
      await cleanupOrphaned.mutateAsync();
    }
  };

  const handleActivate = async (programId: string, isAiGenerated: boolean) => {
    if (!isAiGenerated) {
      try {
        await setActiveProgram.mutateAsync(programId);
        toast({
          title: "Program activated",
          description: "This program is now your active program.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to activate program",
          variant: "destructive",
        });
      }
    }
  };

  if (showBuilder) {
    if (builderType === 'ai') {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <Button 
            variant="outline" 
            onClick={() => setShowBuilder(false)}
            className="mb-6"
          >
            ← Back to Programs
          </Button>
          <ProgramBuilderForm onProgramGenerated={() => setShowBuilder(false)} />
        </div>
      );
    } else {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <Button 
            variant="outline" 
            onClick={() => setShowBuilder(false)}
            className="mb-6"
          >
            ← Back to Programs
          </Button>
          <EnhancedProgramBuilder onProgramCreated={() => setShowBuilder(false)} />
        </div>
      );
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Training Programs</h1>
          <p className="text-muted-foreground">
            Create and manage your workout programs
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setBuilderType('ai');
                setShowBuilder(true);
              }}
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Program
            </Button>
            <Button 
              onClick={() => {
                setBuilderType('manual');
                setShowBuilder(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Manual Program
            </Button>
          </div>
          {isAdmin && (
            <Button 
              onClick={handleCleanupOrphaned} 
              variant="outline" 
              size="sm"
            >
              🧹 Cleanup Orphaned Templates
            </Button>
          )}
        </div>
      </div>

      {(aiLoading || manualLoading) ? (
        <div className="grid gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : allPrograms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No programs yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first program using AI or build one manually
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline"
                onClick={() => {
                  setBuilderType('ai');
                  setShowBuilder(true);
                }}
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Program
              </Button>
              <Button 
                onClick={() => {
                  setBuilderType('manual');
                  setShowBuilder(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Manual Program
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allPrograms.map((program) => (
            <Card 
              key={program.id}
              className="hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setSelectedProgramId(program.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{program.name || 'Unnamed Program'}</CardTitle>
                      <Badge variant={'ai_generated' in program && program.ai_generated ? 'default' : 'outline'}>
                        {'ai_generated' in program && program.ai_generated ? (
                          <>
                            <Brain className="h-3 w-3 mr-1" />
                            AI Generated
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            Manual
                          </>
                        )}
                      </Badge>
                      {program.is_active && (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </div>
                    {'goal' in program && program.goal && (
                      <p className="text-sm text-muted-foreground">
                        {program.goal}
                      </p>
                    )}
                    {'description' in program && program.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {program.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditClick(program)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteClick(program.id, 'ai_generated' in program && program.ai_generated || false)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {!program.is_active && !('ai_generated' in program && program.ai_generated) && (
                      <Button 
                        size="sm"
                        onClick={() => handleActivate(program.id, 'ai_generated' in program && program.ai_generated || false)}
                      >
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Created {new Date(program.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the training program.
              {programToDelete?.isAi && (
                <span className="block mt-2 font-medium text-foreground">
                  Note: Workout templates created by this AI program that are not used in other programs will also be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <ProgramEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        program={programToEdit}
      />
      
      <EdgeFunctionDebugPanel />
      <DebugPanel />
    </div>
  );
}