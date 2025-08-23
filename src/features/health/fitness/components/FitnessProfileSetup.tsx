import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useUpsertFitnessProfile } from '../hooks/useFitnessProfile.hook';
import { Loader2 } from 'lucide-react';
import { ExperienceLevelSelector } from './ExperienceLevelSelector';

export const FitnessProfileSetup = ({ onComplete }: { onComplete?: () => void }) => {
  const [formData, setFormData] = useState({
    goal: '',
    training_goal: '',
    experience_level: '',
    bodyweight: '',
    height_cm: '',
    days_per_week: '',
    preferred_session_minutes: ''
  });

  const upsertProfile = useUpsertFitnessProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.goal || !formData.training_goal || !formData.experience_level) {
      return;
    }

    try {
      await upsertProfile.mutateAsync({
        goal: formData.goal,
        training_goal: formData.training_goal,
        experience_level: formData.experience_level as "new" | "returning" | "intermediate" | "advanced" | "very_experienced",
        bodyweight: formData.bodyweight ? Number(formData.bodyweight) : undefined,
        height_cm: formData.height_cm ? Number(formData.height_cm) : undefined,
        days_per_week: formData.days_per_week ? Number(formData.days_per_week) : undefined,
        preferred_session_minutes: formData.preferred_session_minutes ? Number(formData.preferred_session_minutes) : undefined,
      });
      
      onComplete?.();
    } catch (error) {
      console.error('Error saving fitness profile:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Set Up Your Fitness Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal">Primary Fitness Goal</Label>
            <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your primary goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lose_weight">Lose Weight</SelectItem>
                <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
                <SelectItem value="gain_weight">Gain Weight</SelectItem>
                <SelectItem value="build_muscle">Build Muscle</SelectItem>
                <SelectItem value="increase_strength">Increase Strength</SelectItem>
                <SelectItem value="improve_endurance">Improve Endurance</SelectItem>
                <SelectItem value="general_fitness">General Fitness</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Training Focus */}
          <div className="space-y-2">
            <Label htmlFor="training_goal">Training Focus</Label>
            <Select value={formData.training_goal} onValueChange={(value) => setFormData({ ...formData, training_goal: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your training focus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="muscle">Muscle Building</SelectItem>
                <SelectItem value="strength">Strength Training</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="power">Power/Athletic</SelectItem>
                <SelectItem value="bodybuilding">Bodybuilding</SelectItem>
                <SelectItem value="general">General Fitness</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level */}
          <div className="space-y-3">
            <Label>Experience Level</Label>
            <ExperienceLevelSelector
              value={formData.experience_level}
              onChange={(level) => setFormData({ ...formData, experience_level: level })}
            />
          </div>

          {/* Body Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bodyweight">Body Weight (kg)</Label>
              <Input
                id="bodyweight"
                type="number"
                value={formData.bodyweight}
                onChange={(e) => setFormData({ ...formData, bodyweight: e.target.value })}
                placeholder="e.g. 70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input
                id="height_cm"
                type="number"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                placeholder="e.g. 175"
              />
            </div>
          </div>

          {/* Training Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="days_per_week">Training Days per Week</Label>
              <Select value={formData.days_per_week} onValueChange={(value) => setFormData({ ...formData, days_per_week: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Days per week" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <SelectItem key={day} value={day.toString()}>{day} {day === 1 ? 'day' : 'days'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_session_minutes">Session Length (minutes)</Label>
              <Select value={formData.preferred_session_minutes} onValueChange={(value) => setFormData({ ...formData, preferred_session_minutes: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Session length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="75">75 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!formData.goal || !formData.training_goal || !formData.experience_level || upsertProfile.isPending}
          >
            {upsertProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};