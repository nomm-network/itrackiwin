import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Clock, History, BarChart3, Settings, Play, Dumbbell, Weight, Hash, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecentWorkouts } from "@/features/health/fitness/services/fitness.api";
import { useDefaultGym } from "@/features/health/fitness/hooks/useGymDetection.hook";
import { GymDetectionDialog } from "@/features/health/fitness/components/GymDetectionDialog";
import { useMyGym } from "@/features/health/fitness/hooks/useMyGym.hook";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useNextProgramBlock } from "@/hooks/useTrainingPrograms";
import { useStartWorkout } from "@/features/workouts";
import TouchOptimizedSetInput from "@/components/workout/TouchOptimizedSetInput";
import SwipeableWorkoutCard from "@/components/workout/SwipeableWorkoutCard";
import { BottomSheet, BottomSheetContent, BottomSheetHeader, BottomSheetTitle, BottomSheetTrigger } from "@/components/ui/bottom-sheet";
import VoiceInput from "@/components/mobile/VoiceInput";
import QuickEntryPad from "@/components/mobile/QuickEntryPad";
import MetricVisualization from "@/components/mobile/MetricVisualization";

const MobileFitness: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: recentWorkouts = [], isLoading } = useRecentWorkouts(5);
  const { data: defaultGym } = useDefaultGym();
  const { gym: selectedGym } = useMyGym();
  const { data: nextBlock } = useNextProgramBlock();
  const startWorkout = useStartWorkout();
  const [quickWeight, setQuickWeight] = useState<number | null>(null);
  const [quickReps, setQuickReps] = useState<number | null>(null);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [showGymDetection, setShowGymDetection] = useState(false);

  // Mock data for metric visualization
  const mockMetricData = [
    { date: '1/15', value: 45 },
    { date: '1/16', value: 47.5 },
    { date: '1/18', value: 50 },
    { date: '1/20', value: 52.5 },
    { date: '1/22', value: 50 },
    { date: '1/24', value: 55 },
  ];

  const handleQuickStart = async () => {
    if (!defaultGym) {
      setShowGymDetection(true);
      return;
    }

    try {
      if (nextBlock) {
        // Start from program
        const result = await startWorkout.mutateAsync({ templateId: nextBlock?.workout_template_id });
        navigate(`/app/workouts/${result.workoutId}`);
      } else {
        // Show template selection or start free workout
        const result = await startWorkout.mutateAsync({});
        navigate(`/app/workouts/${result.workoutId}`);
      }
    } catch (error) {
      console.error('Failed to start workout:', error);
      navigate("/fitness/session/new");
    }
  };

  const handleGymSelected = () => {
    handleQuickStart();
  };

  const quickActions = [
    {
      label: nextBlock ? 'Start Program' : t('quickStart'),
      icon: Play,
      onClick: handleQuickStart,
      color: nextBlock ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-500 hover:bg-green-600 text-white"
    },
    {
      label: 'Programs',
      icon: Repeat,
      href: "/app/programs",
      color: "bg-indigo-500 hover:bg-indigo-600 text-white"
    },
    {
      label: t('templates'),
      icon: Dumbbell,
      href: "/fitness/templates",
      color: "bg-blue-500 hover:bg-blue-600 text-white"
    },
    {
      label: t('history'),
      icon: History,
      href: "/fitness/history",
      color: "bg-orange-500 hover:bg-orange-600 text-white"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-6">
        {/* Current Gym Header */}
        {selectedGym && (
          <section>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Current Gym</h3>
                <p className="font-medium">{selectedGym.name}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard?cat=health&sub=configure')}
              >
                Change
              </Button>
            </div>
          </section>
        )}
        {/* Quick Actions Grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4">{t('quickActions')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return action.onClick ? (
                <Button
                  key={action.label}
                  onClick={action.onClick}
                  className={`h-20 flex-col gap-2 touch-manipulation ${action.color}`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              ) : (
                <Button
                  key={action.label}
                  asChild
                  className={`h-20 flex-col gap-2 touch-manipulation ${action.color}`}
                >
                  <Link to={action.href}>
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </section>

        {/* Enhanced Quick Entry */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={!showQuickEntry ? "default" : "outline"}
              className="flex-1"
              onClick={() => setShowQuickEntry(false)}
            >
              Quick Input
            </Button>
            <Button
              variant={showQuickEntry ? "default" : "outline"}
              className="flex-1"
              onClick={() => setShowQuickEntry(true)}
            >
              Entry Pad
            </Button>
          </div>

          {!showQuickEntry ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('quickLog')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <VoiceInput
                  onResult={(text) => {
                    import('@/lib/voiceParser').then(({ parseVoiceInput }) => {
                      const parsed = parseVoiceInput(text);
                      if (parsed.weight) setQuickWeight(parsed.weight);
                      if (parsed.reps) setQuickReps(parsed.reps);
                    });
                  }}
                  placeholder="Say: '10 reps at 50 kilos'"
                />
                
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      <Weight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Weight</span>
                    </div>
                    <TouchOptimizedSetInput
                      value={quickWeight}
                      onChange={setQuickWeight}
                      suffix="kg"
                      max={500}
                      step={2.5}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs font-medium text-muted-foreground"># Reps</span>
                    </div>
                    <TouchOptimizedSetInput
                      value={quickReps}
                      onChange={setQuickReps}
                      max={100}
                      className="w-full"
                    />
                  </div>
                </div>
                <Button 
                  className="w-full h-12 touch-manipulation"
                  disabled={!quickWeight || !quickReps}
                  onClick={() => {
                    console.log('Logging set:', quickWeight, quickReps);
                    setQuickWeight(null);
                    setQuickReps(null);
                  }}
                >
                  {t('logSet')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <QuickEntryPad
              onSubmit={(weight, reps) => {
                console.log('Quick entry:', weight, reps);
                setQuickWeight(weight);
                setQuickReps(reps);
              }}
              lastWeight={quickWeight || 0}
              lastReps={quickReps || 0}
            />
          )}
        </div>

        {/* Progress Metrics */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            <MetricVisualization
              title="Weight Progress"
              data={mockMetricData}
              unit="kg"
              target={60}
              type="line"
            />
            <MetricVisualization
              title="Volume"
              data={mockMetricData.map(d => ({ ...d, value: d.value * 8 }))}
              unit="kg"
              type="bar"
            />
          </div>
        </section>

        {/* Recent Workouts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('recentWorkouts')}</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/fitness/history">
                {t('common.viewAll')}
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <SwipeableWorkoutCard
                  key={workout.id}
                  onEdit={() => console.log('Edit workout', workout.id)}
                  onDelete={() => console.log('Delete workout', workout.id)}
                  isCompleted={!!workout.ended_at}
                >
                  <Link to={`/fitness/history/${workout.id}`} className="block">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">
                          {workout.title || t('workout')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(workout.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={workout.ended_at ? "default" : "secondary"}>
                          {workout.ended_at ? t('completed') : t('inProgress')}
                        </Badge>
                        {workout.ended_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round((new Date(workout.ended_at).getTime() - new Date(workout.started_at).getTime()) / 60000)}m
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </SwipeableWorkoutCard>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{t('noWorkouts')}</p>
                <Button asChild>
                  <Link to="/fitness/session/new">
                    {t('startFirstWorkout')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Quick Settings */}
        <BottomSheet>
          <BottomSheetTrigger asChild>
            <Button variant="outline" className="w-full h-12 touch-manipulation">
              <Settings className="h-4 w-4 mr-2" />
              {t('settings')}
            </Button>
          </BottomSheetTrigger>
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>{t('settings')}</BottomSheetTitle>
            </BottomSheetHeader>
            <div className="p-4 space-y-4">
              <Button variant="ghost" className="w-full justify-start h-12" asChild>
                <Link to="/dashboard?cat=health&sub=configure">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start h-12" asChild>
                <Link to="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('profile')}
                </Link>
              </Button>
            </div>
          </BottomSheetContent>
        </BottomSheet>
      </div>

      <GymDetectionDialog
        open={showGymDetection}
        onOpenChange={setShowGymDetection}
        onGymSelected={handleGymSelected}
      />
    </div>
  );
};

export default MobileFitness;