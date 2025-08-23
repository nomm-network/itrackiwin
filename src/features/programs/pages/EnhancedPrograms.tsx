import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Settings, Plus } from 'lucide-react';
import { EnhancedProgramBuilder } from '../components/EnhancedProgramBuilder';
import { useTrainingPrograms, useSetActiveProgram, useNextProgramBlock } from '@/hooks/useTrainingPrograms';
import { useState } from 'react';

export default function EnhancedPrograms() {
  const [showBuilder, setShowBuilder] = useState(false);
  const { data: programs = [], isLoading } = useTrainingPrograms();
  const { data: nextBlock } = useNextProgramBlock();
  const setActiveProgram = useSetActiveProgram();

  const handleActivateProgram = async (programId: string) => {
    try {
      await setActiveProgram.mutateAsync(programId);
    } catch (error) {
      console.error('Failed to activate program:', error);
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
              
              <Button>
                Start Workout
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
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
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
    </div>
  );
}