import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showPRToast } from '@/components/gamification/PRToast';
import { showXPToast } from '@/components/gamification/XPToast';
import { Trophy, Target, Zap } from 'lucide-react';

const PRAnnouncementDemo: React.FC = () => {
  const [exerciseName, setExerciseName] = useState('Bench Press');
  const [prType, setPrType] = useState('heaviest');
  const [value, setValue] = useState('100');
  const [unit, setUnit] = useState('kg');

  const simulatePR = () => {
    const personalRecord = {
      id: crypto.randomUUID(),
      kind: prType,
      value: parseFloat(value),
      unit: prType === 'reps' ? 'reps' : unit,
      exercise_id: crypto.randomUUID(),
      achieved_at: new Date().toISOString()
    };

    // Show PR toast
    showPRToast({
      personalRecord,
      exerciseName,
      workoutId: crypto.randomUUID(),
      onShare: () => {
        alert('Share functionality would post to social feed!');
      }
    });

    // Show XP reward
    const xpAmount = prType === '1RM' ? 50 : prType === 'heaviest' ? 30 : 20;
    setTimeout(() => {
      showXPToast({
        xpGained: xpAmount,
        reason: `${prType === 'heaviest' ? 'Weight' : prType === '1RM' ? '1RM' : 'Rep'} PR on ${exerciseName}!`
      });
    }, 1000);
  };

  const simulateAchievement = () => {
    showXPToast({
      xpGained: 25,
      reason: "Personal Record achieved!",
      achievement: {
        title: "PR Machine",
        icon: "🏆",
        points: 100
      }
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">PR Announcement Demo</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Test PR Toast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise Name</Label>
              <Input
                id="exercise"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="Exercise name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prType">PR Type</Label>
              <Select value={prType} onValueChange={setPrType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heaviest">Weight PR</SelectItem>
                  <SelectItem value="reps">Rep PR</SelectItem>
                  <SelectItem value="1RM">1RM PR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Value"
                />
              </div>
              {prType !== 'reps' && (
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lbs">lbs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button onClick={simulatePR} className="w-full">
              <Trophy className="h-4 w-4 mr-2" />
              Simulate PR Toast
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Test Achievement Toast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test the achievement unlock flow that triggers after earning PRs.
            </p>

            <Button onClick={simulateAchievement} className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Simulate Achievement Unlock
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How PR Detection Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">1. Set Logging</h3>
              <p className="text-sm text-muted-foreground">
                When a user logs a set, the system automatically checks for new personal records.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">2. PR Detection</h3>
              <p className="text-sm text-muted-foreground">
                Compares weight, reps, and estimated 1RM against existing PRs for that exercise.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">3. Social Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Users can instantly share their PR achievement to the social feed with one tap.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PRAnnouncementDemo;