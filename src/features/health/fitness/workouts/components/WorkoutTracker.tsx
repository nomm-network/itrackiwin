import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  workoutId: string;
}

interface Exercise {
  id: string;
  name: string;
  previousWeight: number;
  previousReps: number;
  targetWeight: number;
  targetReps: number;
  completedSets: number;
  targetSets: number;
}

const WorkoutTracker: React.FC<Props> = ({ workoutId }) => {
  const [currentWeight, setCurrentWeight] = useState(80);
  const [currentReps, setCurrentReps] = useState(12);
  const [selectedFeel, setSelectedFeel] = useState<string>('=');
  const [showWarmupFeedback, setShowWarmupFeedback] = useState(true);

  // Mock data - replace with actual API calls
  const workout = { title: 'Sample Workout' };
  const exercise: Exercise = {
    id: '1',
    name: 'Barbell Deadlift',
    previousWeight: 80,
    previousReps: 10,
    targetWeight: 80,
    targetReps: 12,
    completedSets: 0,
    targetSets: 3
  };

  const feelOptions = [
    { value: '--', emoji: '😵‍💫', label: 'Too hard' },
    { value: '-', emoji: '😖', label: 'Hard' },
    { value: '=', emoji: '😊', label: 'Perfect' },
    { value: '+', emoji: '😄', label: 'Easy' },
    { value: '++', emoji: '😎', label: 'Too easy' }
  ];

  const warmupFeedbackOptions = [
    { value: 'too-little', emoji: '🥶', label: 'Too little' },
    { value: 'excellent', emoji: '🔥', label: 'Excellent' },
    { value: 'too-much', emoji: '😰', label: 'Too much' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon">
          <span className="text-xl">☰</span>
        </Button>
        <h1 className="text-xl font-semibold">iTrack.iWin.</h1>
        <div className="w-10" />
      </div>

      {/* Warm-up Feedback */}
      {showWarmupFeedback && (
        <Card className="mb-6 p-6 bg-card">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              Warm-up 🏃
            </h2>
            <p className="text-muted-foreground">
              Strategy: ramped • Top: 90kg • Auto-adjusts from feedback
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Steps</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-400">36kg × 12 reps</span>
                <span className="text-muted-foreground">s rest</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">54kg × 10 reps</span>
                <span className="text-muted-foreground">s rest</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">72kg × 8 reps</span>
                <span className="text-muted-foreground">s rest</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-4 flex items-center gap-2">
              How was the warm-up? Pick 👇
            </p>
            <div className="flex gap-3">
              {warmupFeedbackOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={option.value === 'excellent' ? 'default' : 'outline'}
                  className="flex-1 flex items-center gap-2 h-12"
                  onClick={() => setShowWarmupFeedback(false)}
                >
                  <span>{option.emoji}</span>
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Exercise Card */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {exercise.name}
            <span className="text-muted-foreground">✋</span>
            <Badge variant="secondary" className="text-xs">
              12/34
            </Badge>
            <span className="text-muted-foreground">🏃</span>
          </h2>
          <span className="text-muted-foreground font-medium">
            {exercise.completedSets}/{exercise.targetSets} sets
          </span>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">Set</span>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
            </div>
            <span className="text-xl">Current Set</span>
          </div>

          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span>📊</span>
                <span>Prev {exercise.previousWeight}kg × {exercise.previousReps} 😊</span>
              </div>
              <span className="text-muted-foreground text-sm">02/09/2025</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>Target {exercise.targetWeight}kg × {exercise.targetReps}</span>
            </div>
          </div>

          {/* Weight Input */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-3">Weight (kg)</label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeight(Math.max(0, currentWeight - 2.5))}
                className="h-12 w-12"
              >
                −
              </Button>
              <div className="flex-1 text-center">
                <div className="text-3xl font-bold">{currentWeight}</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeight(currentWeight + 2.5)}
                className="h-12 w-12"
              >
                +
              </Button>
            </div>
          </div>

          {/* Reps Input */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-3">Reps</label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentReps(Math.max(0, currentReps - 1))}
                className="h-12 w-12"
              >
                −
              </Button>
              <div className="flex-1 text-center">
                <div className="text-3xl font-bold">{currentReps}</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentReps(currentReps + 1)}
                className="h-12 w-12"
              >
                +
              </Button>
            </div>
          </div>

          {/* Feel Selection */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-3">How did that feel?</label>
            <div className="flex gap-2">
              {feelOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedFeel === option.value ? 'default' : 'outline'}
                  className="flex-1 h-16 flex flex-col items-center gap-1"
                  onClick={() => setSelectedFeel(option.value)}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-xs">{option.value}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Pain Check */}
          <Button variant="outline" className="w-full mb-6 h-12 text-green-400 border-green-400">
            <span className="mr-2">✅</span>
            No pain 🚫
          </Button>

          {/* Log Set Button */}
          <Button className="w-full h-14 text-lg font-semibold bg-green-500 hover:bg-green-600">
            Log Set 1
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutTracker;
