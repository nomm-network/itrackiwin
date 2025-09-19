import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Settings, Globe, Bell, Shield, Trash2 } from 'lucide-react';
import { useAppTranslation, useEnumDisplay } from '@/hooks/useAppTranslation';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  id: string;
  user_id: string;
  display_name: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  is_public: boolean;
}

interface FitnessProfile {
  sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bodyweight?: number | null;
  height?: number | null;
  height_cm?: number | null;
  experience_level?: 'new' | 'returning' | 'intermediate' | 'advanced' | 'very_experienced';
  goal?: string;
  training_goal?: string;
  days_per_week?: number | null;
  injuries?: string[] | null;
}

const TranslatedProfilePage: React.FC = () => {
  const { t, tSync, batchTranslate, currentLanguage, setLanguage } = useAppTranslation();
  const { enumDisplaySync } = useEnumDisplay();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fitnessProfile, setFitnessProfile] = useState<FitnessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Load translations for this page
  useEffect(() => {
    const loadTranslations = async () => {
      const keys = [
        'profile.title',
        'profile.personal_info',
        'profile.display_name',
        'profile.username',
        'profile.bio',
        'profile.avatar',
        'profile.public_profile',
        'profile.fitness_info',
        'profile.sex',
        'profile.age',
        'profile.height',
        'profile.weight',
        'profile.activity_level',
        'profile.experience_level',
        'profile.primary_goal',
        'profile.available_days',
        'profile.session_duration',
        'profile.injuries',
        'profile.settings',
        'profile.language',
        'profile.notifications',
        'profile.privacy',
        'profile.danger_zone',
        'profile.delete_account',
        'common.save',
        'common.cancel',
        'common.edit',
        'common.delete',
        'common.confirm',
        'common.loading',
        'common.error',
        'common.success',
        'units.cm',
        'units.kg',
        'units.minutes',
        'units.days_per_week',
        'placeholders.enter_display_name',
        'placeholders.enter_username',
        'placeholders.tell_about_yourself',
        'messages.profile_updated',
        'messages.fitness_profile_updated',
        'messages.error_loading_profile',
        'messages.error_saving_profile'
      ];
      
      const loadedTranslations = await batchTranslate(keys);
      setTranslations(loadedTranslations);
    };

    loadTranslations();
  }, [batchTranslate, currentLanguage]);

  // Load profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load general profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Load fitness profile
      const { data: fitnessData } = await supabase
        .from('user_profile_fitness')
        .select('sex, experience_level, goal, training_goal, days_per_week, injuries')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fitnessData) {
        setFitnessProfile(fitnessData);
      }

    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error(translations['messages.error_loading_profile'] || 'Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({ ...profile, user_id: user.id });

      if (error) throw error;

      toast.success(translations['messages.profile_updated'] || 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(translations['messages.error_saving_profile'] || 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFitnessProfile = async () => {
    if (!fitnessProfile) return;
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Extract bodyweight and height_cm for separate handling
      const { bodyweight, height_cm, height, ...profileData } = fitnessProfile;

      // Save fitness profile (without body metrics)
      const { error } = await supabase
        .from('user_profile_fitness')
        .upsert({
          user_id: user.id,
          sex: profileData.sex,
          experience_level: profileData.experience_level || 'new',
          goal: profileData.goal || 'general_fitness',
          training_goal: profileData.training_goal || 'general_fitness',
          days_per_week: profileData.days_per_week,
          injuries: profileData.injuries
        });

      if (error) throw error;

      // Save body metrics to separate table if provided
      if (bodyweight || height_cm || height) {
        const bodyMetricsData: any = {
          user_id: user.id,
        };

        if (bodyweight) {
          bodyMetricsData.weight_kg = bodyweight;
        }
        if (height_cm) {
          bodyMetricsData.height_cm = height_cm;
        } else if (height) {
          bodyMetricsData.height_cm = height; // Convert height to height_cm
        }

        const { error: bodyMetricsError } = await supabase
          .from('user_body_metrics')
          .insert(bodyMetricsData);

        if (bodyMetricsError) {
          console.error('Error saving body metrics:', bodyMetricsError);
          // Don't throw here to avoid blocking the main profile save
        }
      }

      toast.success(translations['messages.fitness_profile_updated'] || 'Fitness profile updated successfully');
    } catch (error) {
      console.error('Error saving fitness profile:', error);
      toast.error(translations['messages.error_saving_profile'] || 'Error saving fitness profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-fluid-s">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">
              {translations['common.loading'] || 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-fluid-s space-y-fluid-s pb-safe-area-bottom">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-fluid-3xl font-bold">
          {translations['profile.title'] || 'Profile'}
        </h1>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Personal Information */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {translations['profile.personal_info'] || 'Personal Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-fluid-s">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback>
                  {profile.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <Label>{translations['profile.avatar'] || 'Avatar'}</Label>
                <Button variant="outline" size="sm">
                  {translations['common.edit'] || 'Edit'}
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-s">
              <div className="space-y-2">
                <Label htmlFor="display_name">
                  {translations['profile.display_name'] || 'Display Name'}
                </Label>
                <Input
                  id="display_name"
                  value={profile.display_name || ''}
                  placeholder={translations['placeholders.enter_display_name'] || 'Enter your display name'}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  {translations['profile.username'] || 'Username'}
                </Label>
                <Input
                  id="username"
                  value={profile.username || ''}
                  placeholder={translations['placeholders.enter_username'] || 'Enter your username'}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">
                {translations['profile.bio'] || 'Bio'}
              </Label>
              <Textarea
                id="bio"
                value={profile.bio || ''}
                placeholder={translations['placeholders.tell_about_yourself'] || 'Tell us about yourself'}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{translations['profile.public_profile'] || 'Public Profile'}</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to find and view your profile
                </p>
              </div>
              <Switch
                checked={profile.is_public}
                onCheckedChange={(checked) => setProfile({ ...profile, is_public: checked })}
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
              {isSaving ? translations['common.loading'] || 'Saving...' : translations['common.save'] || 'Save'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fitness Information */}
      {fitnessProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {translations['profile.fitness_info'] || 'Fitness Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-fluid-s">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-fluid-s">
              {/* Sex */}
              <div className="space-y-2">
                <Label>{translations['profile.sex'] || 'Sex'}</Label>
                <Select
                  value={fitnessProfile.sex || ''}
                  onValueChange={(value: 'male' | 'female' | 'other' | 'prefer_not_to_say') => setFitnessProfile({ ...fitnessProfile, sex: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['male', 'female', 'other', 'prefer_not_to_say'].map(option => {
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

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="height">
                  {translations['profile.height'] || 'Height'} ({translations['units.cm'] || 'cm'})
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={fitnessProfile.height_cm || ''}
                  onChange={(e) => setFitnessProfile({ 
                    ...fitnessProfile, 
                    height_cm: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight">
                  {translations['profile.weight'] || 'Weight'} ({translations['units.kg'] || 'kg'})
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={fitnessProfile.bodyweight || ''}
                  onChange={(e) => setFitnessProfile({ 
                    ...fitnessProfile, 
                    bodyweight: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                />
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label>{translations['profile.experience_level'] || 'Experience Level'}</Label>
                <Select
                  value={fitnessProfile.experience_level || ''}
                  onValueChange={(value: 'new' | 'returning' | 'intermediate' | 'advanced' | 'very_experienced') => setFitnessProfile({ ...fitnessProfile, experience_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['new', 'returning', 'intermediate', 'advanced', 'very_experienced'].map(option => {
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

              {/* Primary Goal */}
              <div className="space-y-2">
                <Label>{translations['profile.primary_goal'] || 'Primary Goal'}</Label>
                <Select
                  value={fitnessProfile.goal || ''}
                  onValueChange={(value) => setFitnessProfile({ ...fitnessProfile, goal: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness', 'rehabilitation'].map(option => {
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

            {/* Injuries */}
            {fitnessProfile.injuries && fitnessProfile.injuries.length > 0 && (
              <div className="space-y-2">
                <Label>{translations['profile.injuries'] || 'Injuries'}</Label>
                <div className="flex flex-wrap gap-2">
                  {fitnessProfile.injuries.map((injury, index) => (
                    <Badge key={index} variant="secondary">
                      {injury}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleSaveFitnessProfile} disabled={isSaving} className="w-full">
              {isSaving ? translations['common.loading'] || 'Saving...' : translations['common.save'] || 'Save'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {translations['profile.settings'] || 'Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-fluid-s">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {translations['profile.language'] || 'Language'}
                </Label>
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

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  {translations['profile.notifications'] || 'Notifications'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive workout reminders and updates
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {translations['profile.privacy'] || 'Privacy'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Control who can see your activity
                </p>
              </div>
              <Switch checked={profile?.is_public} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {translations['profile.danger_zone'] || 'Danger Zone'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-destructive">
                {translations['profile.delete_account'] || 'Delete Account'}
              </h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" className="w-full">
              {translations['profile.delete_account'] || 'Delete Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslatedProfilePage;