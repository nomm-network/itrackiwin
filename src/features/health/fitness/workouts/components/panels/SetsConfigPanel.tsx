import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Props = {
  workoutExerciseId: string;
  initialTargetSets?: number | null;
  onSaved?: (newTarget: number) => void;
};

export default function SetsConfigPanel({ workoutExerciseId, initialTargetSets = 3, onSaved }: Props) {
  const [val, setVal] = useState<number>(initialTargetSets || 3);
  const [saving, setSaving] = useState(false);
  const dec = () => setVal(v => Math.max(1, v - 1));
  const inc = () => setVal(v => Math.min(10, v + 1));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('workout_exercises')
      .update({ target_sets: val })
      .eq('id', workoutExerciseId);
    setSaving(false);
    if (error) return console.error('[sets-config] update error', error);
    onSaved?.(val);
  };

  return (
    <div className="rounded-xl bg-[#0f1f1b] border border-emerald-900/40 p-3 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-emerald-100/80">Target sets</span>
        <div className="flex items-center gap-2">
          <button onClick={dec} className="w-8 h-8 rounded-full bg-emerald-900/50 text-emerald-100 hover:bg-emerald-900/70 transition-colors">−</button>
          <div className="w-10 text-center text-emerald-100">{val}</div>
          <button onClick={inc} className="w-8 h-8 rounded-full bg-emerald-900/50 text-emerald-100 hover:bg-emerald-900/70 transition-colors">+</button>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="px-3 py-1 rounded-md bg-emerald-600 text-emerald-50 text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <p className="mt-1 text-xs text-emerald-100/60">This only changes the **target** (0/3 badge). It won't auto-create rows.</p>
    </div>
  );
}