import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Target, Calendar, Clock, ArrowRight } from 'lucide-react';

interface FitnessProfile {
  goal: 'lose' | 'maintain' | 'gain';
  training_goal: 'hypertrophy' | 'strength' | 'conditioning';
  experience_level: 'new' | 'returning' | 'intermediate' | 'advanced';
  bodyweight?: number;
  height_cm?: number;
  injuries: string[];
  days_per_week: number;
  preferred_session_minutes: number;
}

const FitnessProfile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [profile, setProfile] = useState<FitnessProfile>({
    goal: 'maintain',
    training_goal: 'hypertrophy',
    experience_level: 'new',
    injuries: [],
    days_per_week: 3,
    preferred_session_minutes: 60
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Extract bodyweight and height_cm for separate handling
      const { bodyweight, height_cm, ...fitnessProfileData } = profile;

      // Save fitness profile (without body metrics)
      const { error: profileError } = await supabase
        .from('user_profile_fitness')
        .upsert({
          user_id: user.id,
          ...fitnessProfileData
        });

      if (profileError) throw profileError;

      // Save body metrics to separate table if provided
      if (bodyweight || height_cm) {
        const bodyMetricsData: any = {
          user_id: user.id,
        };

        if (bodyweight) {
          bodyMetricsData.weight_kg = bodyweight;
        }
        if (height_cm) {
          bodyMetricsData.height_cm = height_cm;
        }

        const { error: bodyMetricsError } = await supabase
          .from('user_body_metrics')
          .insert(bodyMetricsData);

        if (bodyMetricsError) throw bodyMetricsError;
      }

      toast({
        title: "Profile Complete!",
        description: "Your fitness profile has been saved successfully.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Fitness Profile
          </CardTitle>
          <p className="text-sm text-muted-foreground">Help us customize your experience</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Goals */}
          <div className="space-y-3">
            <Label>Primary Goal</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'lose', label: 'Lose', icon: '📉' },
                { value: 'maintain', label: 'Maintain', icon: '⚖️' },
                { value: 'gain', label: 'Gain', icon: '📈' }
              ].map(goal => (
                <Button
                  key={goal.value}
                  variant={profile.goal === goal.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProfile(prev => ({ ...prev, goal: goal.value as any }))}
                  className="flex flex-col h-auto py-3"
                >
                  <span className="text-lg mb-1">{goal.icon}</span>
                  <span className="text-xs">{goal.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Training Focus */}
          <div className="space-y-3">
            <Label>Training Focus</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'hypertrophy', label: 'Muscle', icon: '💪' },
                { value: 'strength', label: 'Strength', icon: '🏋️' },
                { value: 'conditioning', label: 'Cardio', icon: '🏃' }
              ].map(focus => (
                <Button
                  key={focus.value}
                  variant={profile.training_goal === focus.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProfile(prev => ({ ...prev, training_goal: focus.value as any }))}
                  className="flex flex-col h-auto py-3"
                >
                  <span className="text-lg mb-1">{focus.icon}</span>
                  <span className="text-xs">{focus.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-3">
            <Label>Experience Level</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'new', label: 'New to fitness' },
                { value: 'returning', label: 'Returning after break' },
                { value: 'intermediate', label: 'Regular exerciser' },
                { value: 'advanced', label: 'Very experienced' }
              ].map(exp => (
                <Button
                  key={exp.value}
                  variant={profile.experience_level === exp.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProfile(prev => ({ ...prev, experience_level: exp.value as any }))}
                  className="h-auto py-2 text-xs"
                >
                  {exp.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bodyweight (kg)</Label>
              <Input
                type="number"
                placeholder="70"
                value={profile.bodyweight || ''}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  bodyweight: e.target.value ? Number(e.target.value) : undefined 
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                type="number"
                placeholder="175"
                value={profile.height_cm || ''}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  height_cm: e.target.value ? Number(e.target.value) : undefined 
                }))}
              />
            </div>
          </div>

          {/* Training Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Days/week
              </Label>
              <Select 
                value={profile.days_per_week.toString()} 
                onValueChange={(value) => setProfile(prev => ({ ...prev, days_per_week: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6].map(days => (
                    <SelectItem key={days} value={days.toString()}>{days} days</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Session length
              </Label>
              <Select 
                value={profile.preferred_session_minutes.toString()} 
                onValueChange={(value) => setProfile(prev => ({ ...prev, preferred_session_minutes: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="75">75 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={isLoading}>
            {isLoading ? 'Setting up...' : 'Complete Setup'} 
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessProfile;