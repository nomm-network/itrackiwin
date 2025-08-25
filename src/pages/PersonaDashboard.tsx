import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, TrendingUp, Dumbbell, Target, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  profile: {
    display_name: string;
    bio: string;
  };
  fitnessProfile: {
    experience_level: string;
    sex: string;
    goal: string;
    days_per_week: number;
    preferred_session_minutes: number;
  };
  stats: {
    totalWorkouts: number;
    thisWeekWorkouts: number;
    averageSessionTime: number;
    strongestLift: { exercise: string; weight: number };
  };
  recentWorkouts: Array<{
    id: string;
    title: string;
    started_at: string;
    ended_at: string;
    exercise_count: number;
  }>;
  templates: Array<{
    id: string;
    name: string;
    exercise_count: number;
  }>;
}

const PersonaDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUser(user);

      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, bio')
        .eq('user_id', user.id)
        .single();

      // Load fitness profile
      const { data: fitnessProfile } = await supabase
        .from('user_profile_fitness')
        .select('experience_level, sex, goal, days_per_week, preferred_session_minutes')
        .eq('user_id', user.id)
        .single();

      // Load workout stats
      const { data: workouts } = await supabase
        .from('workouts')
        .select('id, title, started_at, ended_at')
        .eq('user_id', user.id)
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: false });

      // Load recent workouts with exercise counts
      const { data: recentWorkouts } = await supabase
        .from('workouts')
        .select(`
          id, title, started_at, ended_at,
          workout_exercises(count)
        `)
        .eq('user_id', user.id)
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: false })
        .limit(5);

      // Load templates
      const { data: templates } = await supabase
        .from('workout_templates')
        .select(`
          id, name,
          template_exercises(count)
        `)
        .eq('user_id', user.id);

      // Load personal records for strongest lift
      const { data: personalRecords } = await supabase
        .from('personal_records')
        .select(`
          value, kind, unit,
          exercises(name)
        `)
        .eq('user_id', user.id)
        .eq('kind', 'heaviest')
        .order('value', { ascending: false })
        .limit(1);

      // Calculate stats
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const thisWeekWorkouts = workouts?.filter(w => 
        new Date(w.started_at) >= weekStart
      ).length || 0;

      const totalWorkouts = workouts?.length || 0;
      
      const averageSessionTime = workouts?.reduce((sum, w) => {
        const start = new Date(w.started_at);
        const end = new Date(w.ended_at);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60);
      }, 0) / totalWorkouts || 0;

      const strongestLift = personalRecords?.[0] ? {
        exercise: personalRecords[0].exercises?.translations?.en?.name || personalRecords[0].exercises?.translations?.ro?.name || 'Unknown',
        weight: personalRecords[0].value
      } : { exercise: 'No records yet', weight: 0 };

      setDashboardData({
        profile: profile || { display_name: 'Demo User', bio: '' },
        fitnessProfile: fitnessProfile || { 
          experience_level: 'new', 
          sex: 'other', 
          goal: 'general_fitness',
          days_per_week: 3,
          preferred_session_minutes: 45
        },
        stats: {
          totalWorkouts,
          thisWeekWorkouts,
          averageSessionTime: Math.round(averageSessionTime),
          strongestLift
        },
        recentWorkouts: recentWorkouts?.map(w => ({
          ...w,
          exercise_count: w.workout_exercises?.[0]?.count || 0
        })) || [],
        templates: templates?.map(t => ({
          ...t,
          exercise_count: t.template_exercises?.[0]?.count || 0
        })) || []
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getWeeklyProgress = () => {
    if (!dashboardData) return 0;
    return Math.round((dashboardData.stats.thisWeekWorkouts / dashboardData.fitnessProfile.days_per_week) * 100);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-fluid-s">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto p-fluid-s">
        <div className="text-center">
          <p className="text-muted-foreground">No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-fluid-s space-y-fluid-s">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-2xl">
              {getSexIcon(dashboardData.fitnessProfile.sex)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-fluid-3xl font-bold">{dashboardData.profile.display_name}</h1>
            <p className="text-muted-foreground">{dashboardData.profile.bio}</p>
            <Badge className={getExperienceBadgeColor(dashboardData.fitnessProfile.experience_level)}>
              {dashboardData.fitnessProfile.experience_level}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-fluid-s">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
                <p className="text-2xl font-bold">{dashboardData.stats.totalWorkouts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{dashboardData.stats.thisWeekWorkouts}</p>
                <p className="text-xs text-muted-foreground">
                  of {dashboardData.fitnessProfile.days_per_week} planned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Session</p>
                <p className="text-2xl font-bold">{formatDuration(dashboardData.stats.averageSessionTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Strongest Lift</p>
                <p className="text-lg font-bold">
                  {dashboardData.stats.strongestLift.weight > 0 
                    ? `${dashboardData.stats.strongestLift.weight}kg`
                    : 'No records'
                  }
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {dashboardData.stats.strongestLift.exercise}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-fluid-s">
        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Workouts Completed</span>
                <span>{dashboardData.stats.thisWeekWorkouts} / {dashboardData.fitnessProfile.days_per_week}</span>
              </div>
              <Progress value={getWeeklyProgress()} className="h-2" />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">Fitness Goals</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Primary Goal:</span>
                  <span className="capitalize">{dashboardData.fitnessProfile.goal.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Training Frequency:</span>
                  <span>{dashboardData.fitnessProfile.days_per_week} days/week</span>
                </div>
                <div className="flex justify-between">
                  <span>Session Length:</span>
                  <span>{dashboardData.fitnessProfile.preferred_session_minutes} minutes</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.recentWorkouts.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{workout.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(workout.started_at).toLocaleDateString()} • {workout.exercise_count} exercises
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(
                        Math.round((new Date(workout.ended_at).getTime() - new Date(workout.started_at).getTime()) / 60000)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No workouts recorded yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workout Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.templates.map((template) => (
                <div key={template.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {template.exercise_count} exercises
                  </p>
                  <Button size="sm" className="mt-2" variant="outline">
                    Start Workout
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No templates created yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonaDashboard;