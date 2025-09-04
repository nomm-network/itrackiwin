import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReadinessData {
  energy: number;
  sleep_quality: number;
  sleep_hours: number;
  soreness: number;
  stress: number;
  illness: boolean;
  alcohol: boolean;
  supplements: string[];
}

interface ReadinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (score: number) => void;
}

const SUPPLEMENT_OPTIONS = [
  'Caffeine', 'Creatine', 'Protein', 'BCAAs', 'Pre-workout', 'Vitamin D', 'Magnesium'
];

export function ReadinessModal({ open, onOpenChange, onComplete }: ReadinessModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<ReadinessData>({
    energy: 5,
    sleep_quality: 5,
    sleep_hours: 7,
    soreness: 5,
    stress: 5,
    illness: false,
    alcohol: false,
    supplements: []
  });

  const handleSupplementToggle = (supplement: string) => {
    setData(prev => ({
      ...prev,
      supplements: prev.supplements.includes(supplement)
        ? prev.supplements.filter(s => s !== supplement)
        : [...prev.supplements, supplement]
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Save readiness check-in
      const { error } = await supabase
        .from('readiness_checkins')
        .insert({
          user_id: user.id,
          energy: data.energy,
          sleep_quality: data.sleep_quality,
          sleep_hours: data.sleep_hours,
          soreness: data.soreness,
          stress: data.stress,
          illness: data.illness,
          alcohol: data.alcohol,
          supplements: data.supplements,
          checkin_at: new Date().toISOString()
        });

      if (error) throw error;

      // Calculate basic score for UI feedback
      const score = Math.round(
        (data.energy * 10) * 0.2 +
        (data.sleep_quality * 10) * 0.2 +
        (data.sleep_hours >= 8 ? 100 : data.sleep_hours * 12.5) * 0.2 +
        ((10 - data.soreness) * 10) * 0.2 +
        ((10 - data.stress) * 10) * 0.1 +
        (data.supplements.length * 5) * 0.1 +
        (data.illness ? -20 : 0) +
        (data.alcohol ? -10 : 0)
      );

      onComplete(Math.max(0, Math.min(100, score)));
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving readiness:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>How are you feeling today?</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium">Energy Level (1-10)</Label>
            <Slider
              value={[data.energy]}
              onValueChange={(value) => setData(prev => ({ ...prev, energy: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="mt-2"
            />
            <div className="text-center text-sm text-muted-foreground mt-1">{data.energy}</div>
          </div>

          <div>
            <Label className="text-sm font-medium">Sleep Quality (1-10)</Label>
            <Slider
              value={[data.sleep_quality]}
              onValueChange={(value) => setData(prev => ({ ...prev, sleep_quality: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="mt-2"
            />
            <div className="text-center text-sm text-muted-foreground mt-1">{data.sleep_quality}</div>
          </div>

          <div>
            <Label className="text-sm font-medium">Hours of Sleep</Label>
            <Slider
              value={[data.sleep_hours]}
              onValueChange={(value) => setData(prev => ({ ...prev, sleep_hours: value[0] }))}
              max={12}
              min={3}
              step={0.5}
              className="mt-2"
            />
            <div className="text-center text-sm text-muted-foreground mt-1">{data.sleep_hours}h</div>
          </div>

          <div>
            <Label className="text-sm font-medium">Muscle Soreness (1-10)</Label>
            <Slider
              value={[data.soreness]}
              onValueChange={(value) => setData(prev => ({ ...prev, soreness: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="mt-2"
            />
            <div className="text-center text-sm text-muted-foreground mt-1">{data.soreness}</div>
          </div>

          <div>
            <Label className="text-sm font-medium">Stress Level (1-10)</Label>
            <Slider
              value={[data.stress]}
              onValueChange={(value) => setData(prev => ({ ...prev, stress: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="mt-2"
            />
            <div className="text-center text-sm text-muted-foreground mt-1">{data.stress}</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="illness"
                checked={data.illness}
                onCheckedChange={(checked) => setData(prev => ({ ...prev, illness: checked as boolean }))}
              />
              <Label htmlFor="illness" className="text-sm">Feeling unwell or sick?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="alcohol"
                checked={data.alcohol}
                onCheckedChange={(checked) => setData(prev => ({ ...prev, alcohol: checked as boolean }))}
              />
              <Label htmlFor="alcohol" className="text-sm">Had alcohol in last 24h?</Label>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Supplements taken today</Label>
            <div className="flex flex-wrap gap-2">
              {SUPPLEMENT_OPTIONS.map((supplement) => (
                <Badge
                  key={supplement}
                  variant={data.supplements.includes(supplement) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSupplementToggle(supplement)}
                >
                  {supplement}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}