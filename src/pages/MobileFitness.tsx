import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Clock, History, BarChart3, Settings, Play, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecentWorkouts } from "@/features/fitness/api";
import { useTranslation } from "react-i18next";
import TouchOptimizedSetInput from "@/components/workout/TouchOptimizedSetInput";
import SwipeableWorkoutCard from "@/components/workout/SwipeableWorkoutCard";
import { BottomSheet, BottomSheetContent, BottomSheetHeader, BottomSheetTitle, BottomSheetTrigger } from "@/components/ui/bottom-sheet";

const MobileFitness: React.FC = () => {
  const { t } = useTranslation();
  const { data: recentWorkouts = [], isLoading } = useRecentWorkouts(5);
  const [quickWeight, setQuickWeight] = useState<number | null>(null);
  const [quickReps, setQuickReps] = useState<number | null>(null);

  const quickActions = [
    {
      label: t('fitness.quickStart'),
      icon: Play,
      href: "/fitness/session/new",
      color: "bg-green-500 hover:bg-green-600 text-white"
    },
    {
      label: t('fitness.templates'),
      icon: Dumbbell,
      href: "/fitness/templates",
      color: "bg-blue-500 hover:bg-blue-600 text-white"
    },
    {
      label: t('fitness.exercises'),
      icon: BarChart3,
      href: "/fitness/exercises",
      color: "bg-purple-500 hover:bg-purple-600 text-white"
    },
    {
      label: t('fitness.history'),
      icon: History,
      href: "/fitness/history",
      color: "bg-orange-500 hover:bg-orange-600 text-white"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-6">
        {/* Quick Actions Grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4">{t('fitness.quickActions')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
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

        {/* Quick Set Logger */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('fitness.quickLog')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <TouchOptimizedSetInput
                value={quickWeight}
                onChange={setQuickWeight}
                label={t('fitness.weight')}
                suffix="kg"
                max={500}
                step={2.5}
                className="flex-1"
              />
              <TouchOptimizedSetInput
                value={quickReps}
                onChange={setQuickReps}
                label={t('fitness.reps')}
                max={100}
                className="flex-1"
              />
            </div>
            <Button 
              className="w-full h-12 touch-manipulation"
              disabled={!quickWeight || !quickReps}
            >
              {t('fitness.logSet')}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Workouts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('fitness.recentWorkouts')}</h2>
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
                          {workout.title || t('fitness.workout')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(workout.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={workout.ended_at ? "default" : "secondary"}>
                          {workout.ended_at ? t('fitness.completed') : t('fitness.inProgress')}
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
                <p className="text-muted-foreground mb-4">{t('fitness.noWorkouts')}</p>
                <Button asChild>
                  <Link to="/fitness/session/new">
                    {t('fitness.startFirstWorkout')}
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
              {t('fitness.settings')}
            </Button>
          </BottomSheetTrigger>
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>{t('fitness.settings')}</BottomSheetTitle>
            </BottomSheetHeader>
            <div className="p-4 space-y-4">
              <Button variant="ghost" className="w-full justify-start h-12" asChild>
                <Link to="/fitness/configure">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('fitness.configure')}
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start h-12" asChild>
                <Link to="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('nav.profile')}
                </Link>
              </Button>
            </div>
          </BottomSheetContent>
        </BottomSheet>
      </div>
    </div>
  );
};

export default MobileFitness;