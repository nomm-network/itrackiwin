import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Battery, Moon, Zap, AlertTriangle, Wine, Pill } from 'lucide-react';

// Use the main ReadinessData interface instead of duplicate
import type { ReadinessData } from "@/components/fitness/EnhancedReadinessCheckIn";

interface PreWorkoutReadinessProps {
  onSubmit: (data: ReadinessData) => void;
  onSkip?: () => void;
  isLoading?: boolean;
}

const energyLabels = ['Dead', 'Low', 'Tired', 'OK', 'Good', 'Great', 'High', 'Peak', 'Wired', 'Explosive'];
const sleepLabels = ['Terrible', 'Poor', 'Bad', 'Below Avg', 'Average', 'Good', 'Great', 'Excellent', 'Perfect', 'Best Ever'];
const sorenessLabels = ['None', 'Minimal', 'Light', 'Mild', 'Moderate', 'Noticeable', 'Significant', 'High', 'Severe', 'Extreme'];
const stressLabels = ['Zen', 'Calm', 'Relaxed', 'Normal', 'Mild', 'Moderate', 'Elevated', 'High', 'Very High', 'Overwhelmed'];
const moodLabels = ['Awful', 'Terrible', 'Bad', 'Poor', 'Low', 'Okay', 'Good', 'Great', 'Excellent', 'Amazing'];

const commonSupplements = ['Caffeine', 'Creatine', 'Pre-workout', 'Protein', 'BCAA', 'Beta-alanine', 'Citrulline', 'Vitamin D'];

export function PreWorkoutReadiness({ onSubmit, onSkip, isLoading = false }: PreWorkoutReadinessProps) {
  const [data, setData] = useState<ReadinessData>({
    energy: 7,
    sleep_quality: 7,
    sleep_hours: 7.5,
    soreness: 3,
    stress: 4,
    mood: 6,
    illness: false,
    alcohol: false,
    energisers_taken: false, // Add missing required field
    supplements: [], // Add as optional
  });

  const handleSliderChange = (field: keyof ReadinessData, value: number[]) => {
    setData(prev => ({ ...prev, [field]: value[0] }));
  };

  const toggleSupplement = (supplement: string) => {
    setData(prev => ({
      ...prev,
      supplements: prev.supplements.includes(supplement)
        ? prev.supplements.filter(s => s !== supplement)
        : [...prev.supplements, supplement]
    }));
  };

  const handleSubmit = () => {
    onSubmit(data);
  };

  const getEnergyColor = (level: number): string => {
    if (level <= 3) return 'text-red-500';
    if (level <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getSorenessColor = (level: number): string => {
    if (level <= 3) return 'text-green-500';
    if (level <= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Pre-Workout Readiness Check
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick check-in to optimize your workout based on how you're feeling
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Energy Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Battery className="h-4 w-4" />
              Energy Level
            </Label>
            <Badge variant="outline" className={getEnergyColor(data.energy)}>
              {energyLabels[data.energy - 1]} ({data.energy}/10)
            </Badge>
          </div>
          <Slider
            value={[data.energy]}
            onValueChange={(value) => handleSliderChange('energy', value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Sleep Quality & Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Sleep Quality
              </Label>
              <Badge variant="outline">
                {sleepLabels[data.sleep_quality - 1]} ({data.sleep_quality}/10)
              </Badge>
            </div>
            <Slider
              value={[data.sleep_quality]}
              onValueChange={(value) => handleSliderChange('sleep_quality', value)}
              max={10}
              min={1}
              step={1}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Sleep Hours</Label>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="16"
              value={data.sleep_hours}
              onChange={(e) => setData(prev => ({ ...prev, sleep_hours: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>

        {/* Soreness & Stress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Soreness
              </Label>
              <Badge variant="outline" className={getSorenessColor(data.soreness)}>
                {sorenessLabels[data.soreness - 1]} ({data.soreness}/10)
              </Badge>
            </div>
            <Slider
              value={[data.soreness]}
              onValueChange={(value) => handleSliderChange('soreness', value)}
              max={10}
              min={1}
              step={1}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Stress Level</Label>
              <Badge variant="outline">
                {stressLabels[data.stress - 1]} ({data.stress}/10)
              </Badge>
            </div>
            <Slider
              value={[data.stress]}
              onValueChange={(value) => handleSliderChange('stress', value)}
              max={10}
              min={1}
              step={1}
            />
          </div>
        </div>

        {/* Mood */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              😊 Mood
            </Label>
            <Badge variant="outline">
              {moodLabels[data.mood - 1]} ({data.mood}/10)
            </Badge>
          </div>
          <Slider
            value={[data.mood]}
            onValueChange={(value) => handleSliderChange('mood', value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Health Factors */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Feeling unwell?
            </Label>
            <Button
              variant={data.illness ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setData(prev => ({ ...prev, illness: !prev.illness }))}
            >
              {data.illness ? 'Yes - Not feeling well' : 'No - Feeling good'}
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Label className="flex items-center gap-2">
              <Wine className="h-4 w-4" />
              Alcohol last 24h?
            </Label>
            <Button
              variant={data.alcohol ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setData(prev => ({ ...prev, alcohol: !prev.alcohol }))}
            >
              {data.alcohol ? 'Yes - Had alcohol' : 'No - None'}
            </Button>
          </div>
        </div>

        {/* Supplements */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Supplements taken today
          </Label>
          <div className="flex flex-wrap gap-2">
            {commonSupplements.map(supplement => (
              <Button
                key={supplement}
                variant={data.supplements.includes(supplement) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSupplement(supplement)}
                className="text-xs"
              >
                {supplement}
              </Button>
            ))}
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          {onSkip && (
            <Button variant="ghost" onClick={onSkip}>
              Skip for now
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isLoading} className="ml-auto">
            {isLoading ? 'Starting Workout...' : 'Start Workout'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}