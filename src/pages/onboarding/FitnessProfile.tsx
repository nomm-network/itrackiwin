import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const FitnessProfile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    goal: '',
    training_goal: '',
    experience_level: '',
    bodyweight: '',
    height_cm: '',
    injuries: [] as string[],
    days_per_week: 3,
    preferred_session_minutes: 60
  });

  const goals = [
    { id: 'lose', label: 'Lose Weight', icon: '📉' },
    { id: 'maintain', label: 'Maintain', icon: '⚖️' },
    { id: 'gain', label: 'Gain Weight', icon: '📈' }
  ];

  const trainingGoals = [
    { id: 'hypertrophy', label: 'Build Muscle', icon: '💪' },
    { id: 'strength', label: 'Get Stronger', icon: '🏋️' },
    { id: 'conditioning', label: 'Get Fit', icon: '🏃' }
  ];

  const experience = [
    { id: 'new', label: 'New to Training', icon: '🌱' },
    { id: 'returning', label: 'Returning After Break', icon: '🔄' },
    { id: 'intermediate', label: 'Some Experience', icon: '📊' },
    { id: 'advanced', label: 'Very Experienced', icon: '🎯' }
  ];

  const commonInjuries = ['Lower Back', 'Shoulder', 'Knee', 'Wrist', 'Neck', 'Hip'];

  const sessionLengths = [45, 60, 75];
  const daysPerWeek = [3, 4, 5, 6];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_profile_fitness')
        .upsert({
          user_id: user.id,
          goal: profile.goal,
          training_goal: profile.training_goal,
          experience_level: profile.experience_level,
          bodyweight: profile.bodyweight ? parseFloat(profile.bodyweight) : null,
          height_cm: profile.height_cm ? parseFloat(profile.height_cm) : null,
          injuries: profile.injuries,
          days_per_week: profile.days_per_week,
          preferred_session_minutes: profile.preferred_session_minutes
        });

      if (error) throw error;

      toast({
        title: "Profile Complete!",
        description: "Let's start your fitness journey"
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInjury = (injury: string) => {
    setProfile(p => ({
      ...p,
      injuries: p.injuries.includes(injury) 
        ? p.injuries.filter(i => i !== injury)
        : [...p.injuries, injury]
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Primary Goal</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {goals.map(goal => (
                  <Button
                    key={goal.id}
                    variant={profile.goal === goal.id ? "default" : "outline"}
                    onClick={() => setProfile(p => ({ ...p, goal: goal.id }))}
                    className="justify-start h-12"
                  >
                    <span className="mr-3">{goal.icon}</span>
                    {goal.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Training Focus</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {trainingGoals.map(tGoal => (
                  <Button
                    key={tGoal.id}
                    variant={profile.training_goal === tGoal.id ? "default" : "outline"}
                    onClick={() => setProfile(p => ({ ...p, training_goal: tGoal.id }))}
                    className="justify-start h-12"
                  >
                    <span className="mr-3">{tGoal.icon}</span>
                    {tGoal.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Experience Level</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {experience.map(exp => (
                  <Button
                    key={exp.id}
                    variant={profile.experience_level === exp.id ? "default" : "outline"}
                    onClick={() => setProfile(p => ({ ...p, experience_level: exp.id }))}
                    className="justify-start h-12"
                  >
                    <span className="mr-3">{exp.icon}</span>
                    {exp.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bodyweight">Bodyweight (kg)</Label>
                <Input
                  id="bodyweight"
                  type="number"
                  placeholder="70"
                  value={profile.bodyweight}
                  onChange={(e) => setProfile(p => ({ ...p, bodyweight: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={profile.height_cm}
                  onChange={(e) => setProfile(p => ({ ...p, height_cm: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Any injuries or limitations?</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonInjuries.map(injury => (
                  <Badge
                    key={injury}
                    variant={profile.injuries.includes(injury) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleInjury(injury)}
                  >
                    {injury}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Days per week</Label>
                <div className="flex gap-2 mt-2">
                  {daysPerWeek.map(days => (
                    <Button
                      key={days}
                      variant={profile.days_per_week === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProfile(p => ({ ...p, days_per_week: days }))}
                    >
                      {days}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Session length</Label>
                <div className="flex gap-2 mt-2">
                  {sessionLengths.map(minutes => (
                    <Button
                      key={minutes}
                      variant={profile.preferred_session_minutes === minutes ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProfile(p => ({ ...p, preferred_session_minutes: minutes }))}
                    >
                      {minutes}m
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return profile.goal && profile.training_goal;
      case 2: return profile.experience_level;
      case 3: return true; // Optional fields
      case 4: return true; // Optional fields
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Fitness Profile
            <span className="text-sm text-muted-foreground">{step}/4</span>
          </CardTitle>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}

          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                Back
              </Button>
            )}
            <Button
              onClick={step === 4 ? handleSave : () => setStep(s => s + 1)}
              disabled={!canProceed() || isLoading}
              className="flex-1"
            >
              {step === 4 ? (isLoading ? 'Saving...' : 'Complete') : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessProfile;