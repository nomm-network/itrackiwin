// workout-flow-v1.0.0 (SOT) – DO NOT DUPLICATE
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Optional: store today's readiness in localStorage so we don't nag
const keyForToday = () => `readiness_${new Date().toISOString().slice(0,10)}`;

export default function ReadinessPage({
  onAfterSubmit,
}: { onAfterSubmit?: (score: number) => void }) {
  const [submitting, setSubmitting] = useState(false);

  const submit = async (score: number | null) => {
    try {
      setSubmitting(true);

      // Persist readiness snapshot (if score provided)
      if (score !== null) {
        // Save "handled today" to localStorage
        localStorage.setItem(keyForToday(), String(score));
      }

      onAfterSubmit?.(score ?? -1);
      // Hand control back to caller – they will start the workout then navigate
    } catch (e: any) {
      toast({
        title: 'Could not save readiness',
        description: e.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const buttons = [1,2,3,4,5,6,7,8,9,10];

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="mb-2 text-2xl font-semibold text-emerald-300">
          How are you feeling today?
        </h2>
        <p className="mb-6 text-slate-300">Rate your readiness from 1–10</p>

        <div className="grid grid-cols-5 gap-3">
          {buttons.map((n) => (
            <button
              key={n}
              disabled={submitting}
              className="h-12 rounded-xl bg-slate-800 text-lg font-semibold hover:bg-slate-700"
              onClick={() => submit(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          disabled={submitting}
          className="mt-6 h-12 w-full rounded-xl bg-slate-700 text-slate-200 hover:bg-slate-600"
          onClick={() => submit(null)}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}