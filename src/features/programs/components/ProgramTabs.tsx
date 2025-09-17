import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, User, Plus, History, Target } from 'lucide-react';
import { ProgramBuilderForm, ProgramPreview, useAIPrograms } from '@/features/ai-coach';
import { EnhancedProgramBuilder } from './EnhancedProgramBuilder';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DebugPanel from '@/components/debug/DebugPanel';
import { EdgeFunctionDebugPanel } from '@/components/debug/EdgeFunctionDebugPanel';

export function ProgramTabs() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAIProgramId, setSelectedAIProgramId] = useState<string | null>(null);
  const [showManualBuilder, setShowManualBuilder] = useState(false);
  
  const { data: aiPrograms = [], isLoading: aiLoading } = useAIPrograms();
  const { data: manualPrograms = [], isLoading: manualLoading } = useTrainingPrograms();

  const selectedAIProgram = aiPrograms.find(p => p.id === selectedAIProgramId);

  const handleAIProgramGenerated = (programId: string) => {
    setSelectedAIProgramId(programId);
    setActiveTab('ai-preview');
  };

  if (showManualBuilder) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowManualBuilder(false)}
            className="mb-4"
          >
            ← Back to Programs
          </Button>
        </div>
        
        <EnhancedProgramBuilder 
          onProgramCreated={() => setShowManualBuilder(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workout Programs</h1>
        <p className="text-muted-foreground">
          Create custom programs manually or let Bro AI build the perfect program for you
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ai-builder" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Builder
          </TabsTrigger>
          <TabsTrigger value="ai-preview" disabled={!selectedAIProgram}>
            <Brain className="h-4 w-4" />
            AI Preview
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Programs Section */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Bro AI Programs
                  <Badge variant="secondary">Smart</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI-generated programs tailored to your goals and experience
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiLoading ? (
                    <div className="space-y-2">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : aiPrograms.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-4">No AI programs yet</p>
                      <Button onClick={() => setActiveTab('ai-builder')}>
                        <Brain className="h-4 w-4 mr-2" />
                        Create AI Program
                      </Button>
                    </div>
                  ) : (
                    <>
                      {aiPrograms.slice(0, 3).map((program) => (
                        <Card 
                          key={program.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            setSelectedAIProgramId(program.id);
                            setActiveTab('ai-preview');
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{program.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {program.weeks} weeks • {program.goal.replace('_', ' ')}
                                </p>
                              </div>
                              <Badge variant={program.status === 'active' ? 'default' : 'outline'}>
                                {program.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {aiPrograms.length > 3 && (
                        <Button variant="outline" onClick={() => setActiveTab('ai-builder')}>
                          View All AI Programs
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Manual Programs Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Manual Programs
                  <Badge variant="outline">Custom</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Hand-crafted programs with full control over every detail
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {manualLoading ? (
                    <div className="space-y-2">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : manualPrograms.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-4">No manual programs yet</p>
                      <Button onClick={() => setShowManualBuilder(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Manual Program
                      </Button>
                    </div>
                  ) : (
                    <>
                      {manualPrograms.slice(0, 3).map((program) => (
                        <Card key={program.id} className="hover:bg-muted/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{program.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {program.goal || 'Custom program'}
                                </p>
                              </div>
                              <Badge variant={program.is_active ? 'default' : 'outline'}>
                                {program.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {manualPrograms.length > 3 && (
                        <Button variant="outline" onClick={() => setActiveTab('manual')}>
                          View All Manual Programs
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-builder" className="mt-8">
          <ProgramBuilderForm onProgramGenerated={handleAIProgramGenerated} />
        </TabsContent>

        <TabsContent value="ai-preview" className="mt-8">
          {selectedAIProgram ? (
            <ProgramPreview 
              program={selectedAIProgram}
              onStartProgram={() => {
                // TODO: Implement program starting logic
                console.log('Starting program:', selectedAIProgram.id);
              }}
            />
          ) : (
            <Card className="max-w-2xl mx-auto text-center">
              <CardContent className="py-12">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No AI Program Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Generate a new AI program or select one from your collection to preview it.
                </p>
                <Button onClick={() => setActiveTab('ai-builder')}>
                  <Brain className="h-4 w-4 mr-2" />
                  Build AI Program
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manual" className="mt-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Manual Programs</h2>
                <p className="text-muted-foreground">
                  Create and manage custom workout programs
                </p>
              </div>
              <Button onClick={() => setShowManualBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Program
              </Button>
            </div>

            {manualLoading ? (
              <div className="grid gap-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : manualPrograms.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    No manual programs yet. Create your first program to get started!
                  </p>
                  <Button onClick={() => setShowManualBuilder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Program
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {manualPrograms.map((program) => (
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
                          <Badge variant="outline">Manual</Badge>
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
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Delete
                          </Button>
                          {!program.is_active && (
                            <Button size="sm">
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
        </TabsContent>
      </Tabs>
      
      
      <EdgeFunctionDebugPanel />
      <DebugPanel forceOpen={true} />
    </div>
  );
}