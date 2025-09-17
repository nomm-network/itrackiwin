import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Target, Dumbbell, PlayCircle } from 'lucide-react';
import { AIProgram } from '../hooks/useBroAICoach';

interface ProgramPreviewProps {
  program: AIProgram;
  onStartProgram?: () => void;
}

export function ProgramPreview({ program, onStartProgram }: ProgramPreviewProps) {
  const firstWeek = program.ai_program_weeks?.find(w => w.week_number === 1);
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Target className="h-6 w-6 text-primary" />
          {program.title}
        </CardTitle>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {program.weeks} weeks
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4" />
            {firstWeek?.ai_program_workouts?.length || 0} days/week
          </div>
          <Badge variant="secondary" className="capitalize">
            {program.goal.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="week1">Week 1</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Program Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{program.weeks} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Training Days:</span>
                    <span className="font-medium">{firstWeek?.ai_program_workouts?.length || 0} per week</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Goal:</span>
                    <Badge variant="secondary" className="capitalize">
                      {program.goal.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={program.status === 'active' ? 'default' : 'outline'}>
                      {program.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Training Split</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {firstWeek?.ai_program_workouts?.map((workout) => (
                      <div key={workout.day_of_week} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {workout.day_of_week}
                          </div>
                          <span className="font-medium">{workout.title}</span>
                        </div>
                        <div className="flex gap-1">
                          {workout.focus_tags?.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="week1" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Week 1 Workouts</CardTitle>
                <p className="text-muted-foreground">
                  Your first week to get started with the program
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {firstWeek?.ai_program_workouts?.map((workout) => (
                    <Card key={workout.day_of_week} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Day {workout.day_of_week}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {workout.focus_tags?.[0]?.replace('_', ' ') || 'workout'}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-primary">{workout.title}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>45-60 minutes</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Preview Workout
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Schedule</CardTitle>
                <p className="text-muted-foreground">
                  Suggested weekly schedule for optimal results
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="text-center">
                      <div className="text-sm font-medium text-muted-foreground mb-2">{day}</div>
                      <div className={`h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-xs ${
                        firstWeek?.ai_program_workouts?.some(w => w.day_of_week === index + 1)
                          ? 'border-primary bg-primary/5 text-primary font-medium'
                          : 'border-muted-foreground/20 text-muted-foreground'
                      }`}>
                        {firstWeek?.ai_program_workouts?.find(w => w.day_of_week === index + 1)?.title || 'Rest'}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Rest days are just as important as training days for recovery and growth.
                  </p>
                  {onStartProgram && (
                    <Button onClick={onStartProgram} size="lg" className="mt-4">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start This Program
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}