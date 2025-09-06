import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User, Settings, Globe } from 'lucide-react';
import { useAppTranslation, useEnumDisplay } from '@/hooks/useAppTranslation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TranslatedProfileDemo: React.FC = () => {
  const { tSync, currentLanguage, setLanguage } = useAppTranslation();
  const { enumDisplaySync } = useEnumDisplay();
  
  const [profile, setProfile] = useState({
    display_name: 'John Doe',
    username: 'johndoe',
    bio: 'Fitness enthusiast',
    is_public: true
  });

  const [fitnessProfile, setFitnessProfile] = useState({
    sex: 'male' as 'male' | 'female' | 'other',
    experience_level: 'intermediate' as string,
    activity_level: 'moderate' as string,
    goal: 'strength' as string
  });

  return (
    <div className="container mx-auto p-fluid-s space-y-fluid-s pb-safe-area-bottom">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-fluid-3xl font-bold">
          {tSync('profile.title', 'Profile')}
        </h1>
        <Select value={currentLanguage} onValueChange={setLanguage}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">🇺🇸 English</SelectItem>
            <SelectItem value="ro">🇷🇴 Română</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {tSync('profile.personal_info', 'Personal Information')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-fluid-s">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-s">
            <div className="space-y-2">
              <Label>{tSync('profile.display_name', 'Display Name')}</Label>
              <Input
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{tSync('profile.username', 'Username')}</Label>
              <Input
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{tSync('profile.public_profile', 'Public Profile')}</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to find and view your profile
              </p>
            </div>
            <Switch
              checked={profile.is_public}
              onCheckedChange={(checked) => setProfile({ ...profile, is_public: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Fitness Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {tSync('profile.fitness_info', 'Fitness Information')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-fluid-s">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-s">
            {/* Sex */}
            <div className="space-y-2">
              <Label>{tSync('profile.sex', 'Sex')}</Label>
              <Select
                value={fitnessProfile.sex}
                onValueChange={(value: 'male' | 'female' | 'other') => 
                  setFitnessProfile({ ...fitnessProfile, sex: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['male', 'female', 'other'] as const).map(option => {
                    const display = enumDisplaySync('sex', option);
                    return (
                      <SelectItem key={option} value={option}>
                        <span className="flex items-center gap-2">
                          <span>{display.icon}</span>
                          <span>{display.label}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <Label>{tSync('profile.experience_level', 'Experience Level')}</Label>
              <Select
                value={fitnessProfile.experience_level}
                onValueChange={(value) => setFitnessProfile({ ...fitnessProfile, experience_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['beginner', 'intermediate', 'advanced'].map(option => {
                    const display = enumDisplaySync('experience_level', option);
                    return (
                      <SelectItem key={option} value={option}>
                        <span className="flex items-center gap-2">
                          <span>{display.icon}</span>
                          <span>{display.label}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Activity Level */}
            <div className="space-y-2">
              <Label>{tSync('profile.activity_level', 'Activity Level')}</Label>
              <Select
                value={fitnessProfile.activity_level}
                onValueChange={(value) => setFitnessProfile({ ...fitnessProfile, activity_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['sedentary', 'light', 'moderate', 'active', 'very_active'].map(option => {
                    const display = enumDisplaySync('activity_level', option);
                    return (
                      <SelectItem key={option} value={option}>
                        <span className="flex items-center gap-2">
                          <span>{display.icon}</span>
                          <span>{display.label}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Primary Goal */}
            <div className="space-y-2">
              <Label>{tSync('profile.primary_goal', 'Primary Goal')}</Label>
              <Select
                value={fitnessProfile.goal}
                onValueChange={(value) => setFitnessProfile({ ...fitnessProfile, goal: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'].map(option => {
                    const display = enumDisplaySync('primary_goal', option);
                    return (
                      <SelectItem key={option} value={option}>
                        <span className="flex items-center gap-2">
                          <span>{display.icon}</span>
                          <span>{display.label}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {tSync('profile.language', 'Language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>{tSync('profile.language', 'Language')}</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred language
              </p>
            </div>
            <Select value={currentLanguage} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="ro">🇷🇴 Română</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button 
        className="w-full" 
        onClick={() => toast.success(tSync('messages.profile_updated', 'Profile updated successfully!'))}
      >
        {tSync('common.save', 'Save Changes')}
      </Button>
    </div>
  );
};

export default TranslatedProfileDemo;