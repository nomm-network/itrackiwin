import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBars } from '@/hooks/useBars';
import { supabase } from '@/integrations/supabase/client';

type Props = {
  workoutExerciseId: string;
  selectedBarId?: string | null;
  onChange: (barId: string | null, barWeightKg: number) => void;
};

export function BarSelector({ workoutExerciseId, selectedBarId, onChange }: Props) {
  const { data: bars = [] } = useBars();
  const [current, setCurrent] = useState<string | null>(selectedBarId ?? null);

  useEffect(() => {
    setCurrent(selectedBarId ?? null);
  }, [selectedBarId]);

  const handleSelect = async (barId: string) => {
    const bar = bars.find(b => b.id === barId) || null;
    setCurrent(barId);

    // persist on the workout_exercises row (default for this exercise instance)
    await supabase.from('workout_exercises')
      .update({ selected_bar_id: barId })
      .eq('id', workoutExerciseId);

    onChange(barId, bar?.weight_kg ?? 0);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground">Bar</label>
      <Select
        value={current ?? ''}
        onValueChange={handleSelect}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select a bar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None</SelectItem>
          {bars.map(bar => (
            <SelectItem key={bar.id} value={bar.id}>
              {bar.name} ({bar.weight_kg} kg)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}