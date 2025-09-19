import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface FitnessProfileData {
  sex: 'male' | 'female' | 'other' | null;
  bodyweight: number | null;
  height_cm: number | null;
  training_age_months: number | null;
  goal: 'hypertrophy' | 'strength' | 'fat_loss' | 'general';
  injuries: Record<string, string>;
  prefer_short_rests: boolean;
}

const FitnessProfile: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch latest body metrics
  const { data: latestMetrics } = useQuery({
    queryKey: ['latest-body-metrics'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) return null;

      const { data, error } = await supabase
        .from('user_body_metrics')
        .select('*')
        .eq('user_id', user.user.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['fitness-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_fitness_profile')
        .select('*')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = useForm<FitnessProfileData>({
    defaultValues: {
      sex: null,
      bodyweight: null,
      height_cm: null,
      training_age_months: null,
      goal: 'hypertrophy',
      injuries: {},
      prefer_short_rests: false,
    },
  });

  const upsertProfile = useMutation({
    mutationFn: async (data: FitnessProfileData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save fitness profile
      const payload = {
        user_id: user.id,
        sex: data.sex,
        training_age_months: data.training_age_months,
        goal: data.goal,
        injuries: data.injuries,
        prefer_short_rests: data.prefer_short_rests,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('user_fitness_profile')
        .upsert(payload);

      if (profileError) throw profileError;

      // Save body metrics if provided
      if (data.bodyweight || data.height_cm) {
        const { error: metricsError } = await supabase
          .from('user_body_metrics')
          .insert({
            user_id: user.id,
            weight_kg: data.bodyweight,
            height_cm: data.height_cm,
            source: 'manual',
            recorded_at: new Date().toISOString(),
          });

        if (metricsError) throw metricsError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your fitness profile has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['fitness-profile'] });
      queryClient.invalidateQueries({ queryKey: ['latest-body-metrics'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  React.useEffect(() => {
    if (profile || latestMetrics) {
      reset({
        sex: profile?.sex as 'male' | 'female' | 'other' | null,
        bodyweight: latestMetrics?.weight_kg,
        height_cm: latestMetrics?.height_cm,
        training_age_months: profile?.training_age_months,
        goal: profile?.goal as 'hypertrophy' | 'strength' | 'fat_loss' | 'general' || 'hypertrophy',
        injuries: (profile?.injuries as Record<string, string>) || {},
        prefer_short_rests: profile?.prefer_short_rests || false,
      });
    }
  }, [profile, latestMetrics, reset]);

  const onSubmit = (data: FitnessProfileData) => {
    upsertProfile.mutate(data);
  };

  if (isLoading) {
    return <div className="container py-6">Loading...</div>;
  }

  return (
    <div className="container py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Fitness Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sex">Sex</Label>
                <Select onValueChange={(value) => setValue('sex', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goal">Primary Goal</Label>
                <Select onValueChange={(value) => setValue('goal', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="fat_loss">Fat Loss</SelectItem>
                    <SelectItem value="general">General Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Body Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bodyweight">Weight (kg)</Label>
                <Input
                  id="bodyweight"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  {...register('bodyweight', { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="height_cm">Height (cm)</Label>
                <Input
                  id="height_cm"
                  type="number"
                  placeholder="175"
                  {...register('height_cm', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Training Experience */}
            <div>
              <Label htmlFor="training_age_months">Training Experience (months)</Label>
              <Input
                id="training_age_months"
                type="number"
                placeholder="24"
                {...register('training_age_months', { valueAsNumber: true })}
              />
            </div>

            {/* Preferences */}
            <div className="flex items-center space-x-2">
              <Switch
                id="prefer_short_rests"
                checked={watch('prefer_short_rests')}
                onCheckedChange={(checked) => setValue('prefer_short_rests', checked)}
              />
              <Label htmlFor="prefer_short_rests">Prefer shorter rest periods</Label>
            </div>

            {/* Injuries */}
            <div>
              <Label htmlFor="injuries">Current Injuries/Limitations</Label>
              <Textarea
                placeholder="e.g., Right shoulder impingement, Lower back tightness..."
                className="min-h-[80px]"
                onChange={(e) => {
                  const text = e.target.value;
                  const injuries = text ? { general: text } : {};
                  setValue('injuries', injuries);
                }}
                defaultValue={typeof profile?.injuries === 'object' && profile.injuries && 'general' in profile.injuries ? String(profile.injuries.general) : ''}
              />
            </div>

            <Button type="submit" disabled={upsertProfile.isPending}>
              {upsertProfile.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessProfile;