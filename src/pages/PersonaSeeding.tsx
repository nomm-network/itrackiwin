import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Users, Trash2, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Persona {
  user_id: string;
  email: string;
  profile: {
    display_name: string;
    bio: string;
  };
  fitness_profile: {
    experience_level: string;
    sex: string;
    goal: string;
    days_per_week: number;
    preferred_session_minutes: number;
  };
  templates: Array<{
    id: string;
    name: string;
  }>;
}

const PersonaSeedingPage: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [lastSeedTime, setLastSeedTime] = useState<Date | null>(null);

  const handleSeedPersonas = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-personas', {
        body: { action: 'seed' }
      });

      if (error) throw error;

      setPersonas(data.personas);
      setLastSeedTime(new Date());
      toast.success('Demo personas created successfully!');
    } catch (error) {
      console.error('Error seeding personas:', error);
      toast.error('Failed to create demo personas');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCleanupPersonas = async () => {
    setIsCleaning(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-personas', {
        body: { action: 'cleanup' }
      });

      if (error) throw error;

      setPersonas([]);
      setLastSeedTime(null);
      toast.success('Demo personas cleaned up successfully!');
    } catch (error) {
      console.error('Error cleaning up personas:', error);
      toast.error('Failed to cleanup demo personas');
    } finally {
      setIsCleaning(false);
    }
  };

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'returning': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSexIcon = (sex: string) => {
    switch (sex) {
      case 'female': return '👩';
      case 'male': return '👨';
      case 'other': return '🧑';
      default: return '👤';
    }
  };

  return (
    <div className="container mx-auto p-fluid-s space-y-fluid-s">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-fluid-3xl font-bold">Demo Persona Seeding</h1>
          <p className="text-muted-foreground mt-2">
            Create test users with realistic fitness profiles and workout histories for demo purposes.
          </p>
        </div>
      </div>

      {/* Personas Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Demo Personas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-fluid-s">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-fluid-s">
            {/* Newbie Maria */}
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👩</span>
                <div>
                  <h3 className="font-semibold">Newbie Maria</h3>
                  <Badge className="text-xs bg-green-100 text-green-800">New</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Female, glute priority, 3d/wk, limited equipment
              </p>
              <div className="space-y-1 text-xs">
                <div>🎯 Goal: Muscle gain</div>
                <div>📅 3 days/week</div>
                <div>⏱️ 45 min sessions</div>
                <div>🏠 Home workouts</div>
              </div>
            </div>

            {/* Returning Alex */}
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👨</span>
                <div>
                  <h3 className="font-semibold">Returning Alex</h3>
                  <Badge className="text-xs bg-blue-100 text-blue-800">Returning</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Male, chest/shoulder priority, 4d/wk, full gym
              </p>
              <div className="space-y-1 text-xs">
                <div>🎯 Goal: Strength</div>
                <div>📅 4 days/week</div>
                <div>⏱️ 60 min sessions</div>
                <div>🏋️ Full gym access</div>
              </div>
            </div>

            {/* Advanced Lee */}
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🧑</span>
                <div>
                  <h3 className="font-semibold">Advanced Lee</h3>
                  <Badge className="text-xs bg-purple-100 text-purple-800">Advanced</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Non-binary, balanced, 5d/wk, barbell garage gym
              </p>
              <div className="space-y-1 text-xs">
                <div>🎯 Goal: Strength</div>
                <div>📅 5 days/week</div>
                <div>⏱️ 75 min sessions</div>
                <div>🏠 Garage gym</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleSeedPersonas} 
              disabled={isSeeding || isCleaning}
              className="flex items-center gap-2"
            >
              {isSeeding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isSeeding ? 'Creating Personas...' : 'Create Demo Personas'}
            </Button>

            <Button 
              onClick={handleCleanupPersonas} 
              disabled={isSeeding || isCleaning || personas.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isCleaning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isCleaning ? 'Cleaning Up...' : 'Cleanup Personas'}
            </Button>
          </div>

          {lastSeedTime && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Personas last created: {lastSeedTime.toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Created Personas */}
      {personas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Created Personas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {personas.map((persona, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getSexIcon(persona.fitness_profile.sex)}
                      </span>
                      <div>
                        <h3 className="font-semibold">{persona.profile.display_name}</h3>
                        <p className="text-sm text-muted-foreground">{persona.email}</p>
                      </div>
                    </div>
                    <Badge className={getExperienceBadgeColor(persona.fitness_profile.experience_level)}>
                      {persona.fitness_profile.experience_level}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {persona.profile.bio}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Goal:</span>
                      <br />
                      {persona.fitness_profile.goal.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span>
                      <br />
                      {persona.fitness_profile.days_per_week} days/week
                    </div>
                    <div>
                      <span className="font-medium">Session Length:</span>
                      <br />
                      {persona.fitness_profile.preferred_session_minutes} minutes
                    </div>
                    <div>
                      <span className="font-medium">Templates:</span>
                      <br />
                      {persona.templates.length} created
                    </div>
                  </div>

                  {persona.templates.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm font-medium">Templates: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {persona.templates.map((template, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {template.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Usage Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Demo Credentials</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Maria:</strong> maria.demo@example.com</li>
                <li>• <strong>Alex:</strong> alex.demo@example.com</li>
                <li>• <strong>Lee:</strong> lee.demo@example.com</li>
                <li>• <strong>Password:</strong> DemoPass123!</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">What's Created</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Complete user profiles</li>
                <li>• Fitness profiles with goals</li>
                <li>• 2-3 workout templates each</li>
                <li>• 3-5 logged workout sessions</li>
                <li>• Progressive overload data</li>
              </ul>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              These are demo accounts for testing purposes. Use the cleanup function to remove them when done.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonaSeedingPage;