import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export type ReadinessData = {
  energy: number;
  soreness?: number;
  sleepQuality?: number;
  sleepHours?: number;
  stress?: number;
  preworkout?: boolean;
  notes?: string;
}

// Legacy alias for backwards compatibility
export type EnhancedReadinessData = ReadinessData;

type Props = {
  onSubmit: (data: ReadinessData) => Promise<void> | void;
  onCancel?: () => void;
  defaultValue?: ReadinessData;
};

export const EnhancedReadinessCheckIn: React.FC<Props> = ({
  onSubmit,
  onCancel,
  defaultValue
}) => {
  const [energy, setEnergy] = useState(defaultValue?.energy ?? 7);
  const [soreness, setSoreness] = useState(defaultValue?.soreness ?? 3);
  const [sleepQuality, setSleepQuality] = useState(defaultValue?.sleepQuality ?? 7);
  const [sleepHours, setSleepHours] = useState(defaultValue?.sleepHours ?? 7);
  const [stress, setStress] = useState(defaultValue?.stress ?? 3);
  const [preworkout, setPreworkout] = useState(defaultValue?.preworkout ?? false);
  const [notes, setNotes] = useState(defaultValue?.notes ?? '');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const energyLabel = useMemo(() => {
    if (energy <= 3) return 'Low';
    if (energy <= 7) return 'OK';
    return 'High';
  }, [energy]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        energy,
        soreness,
        sleepQuality,
        sleepHours,
        stress,
        preworkout,
        notes: notes?.trim() || undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#1F2A37] bg-[#0B1220] p-6 shadow">
      <h2 className="text-[22px] font-semibold text-[#8FFFC6]">How are you feeling today?</h2>
      <p className="mt-1 text-[14px] text-[#9AA4B2]">Rate your readiness 1–10</p>

      <div className="mt-4 rounded-xl border border-[#1E2A3A] bg-[#0E1726] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#9AA4B2]">Energy</span>
          <span className="text-[13px] font-medium text-[#E5E7EB]">
            {energy}/10 · {energyLabel}
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={10}
          value={energy}
          onChange={(e) => setEnergy(Number(e.target.value))}
          className="mt-3 h-2 w-full cursor-pointer appearance-none rounded bg-[#1B2736]"
        />

        <div className="mt-2 grid grid-cols-10 gap-1">
          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
            <button
              key={n}
              onClick={() => setEnergy(n)}
              className={cn(
                "h-8 rounded-md text-[12px] font-semibold",
                energy === n
                  ? "bg-[#8FFFC6] text-[#0B1220]"
                  : "bg-[#121B2A] text-[#D1D5DB] hover:bg-[#162238]"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowAdvanced(v => !v)}
        className="mt-4 w-full rounded-lg border border-[#223048] bg-[#0E1726] py-2 text-[13px] text-[#A7B1C2] hover:bg-[#111D2E]"
      >
        {showAdvanced ? "Hide details" : "Add details"}
      </button>

      {showAdvanced && (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-[#1E2A3A] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#9AA4B2]">Soreness</span>
              <span className="text-[13px] text-[#D1D5DB]">{soreness}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={soreness}
              onChange={(e) => setSoreness(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer rounded bg-[#1B2736]"
            />
          </div>

          <div className="rounded-lg border border-[#1E2A3A] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#9AA4B2]">Sleep Quality</span>
              <span className="text-[13px] text-[#D1D5DB]">{sleepQuality}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={sleepQuality}
              onChange={(e) => setSleepQuality(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer rounded bg-[#1B2736]"
            />
          </div>

          <div className="rounded-lg border border-[#1E2A3A] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#9AA4B2]">Sleep Hours</span>
              <span className="text-[13px] text-[#D1D5DB]">{sleepHours}h</span>
            </div>
            <input
              type="range"
              min={3}
              max={12}
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer rounded bg-[#1B2736]"
            />
          </div>

          <div className="rounded-lg border border-[#1E2A3A] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#9AA4B2]">Stress</span>
              <span className="text-[13px] text-[#D1D5DB]">{stress}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={stress}
              onChange={(e) => setStress(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer rounded bg-[#1B2736]"
            />
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[#D1D5DB]">
            <input
              type="checkbox"
              checked={preworkout}
              onChange={(e) => setPreworkout(e.target.checked)}
              className="h-4 w-4 rounded border-[#2A3A51] bg-[#0E1726]"
            />
            Took pre-workout
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes before training?"
            className="w-full rounded-lg border border-[#1E2A3A] bg-[#0E1726] p-2 text-[13px] text-[#E5E7EB] placeholder-[#667085]"
            rows={3}
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => onCancel?.()}
          className="h-11 rounded-xl border border-[#223048] bg-[#0E1726] text-[14px] font-semibold text-[#A7B1C2] hover:bg-[#111D2E]"
        >
          Cancel
        </button>
        <button
          disabled={isSubmitting}
          onClick={handleSubmit}
          className={cn(
            "h-11 rounded-xl text-[14px] font-semibold",
            isSubmitting
              ? "bg-[#1F2A37] text-[#9AA4B2]"
              : "bg-[#8FFFC6] text-[#0B1220] hover:brightness-95"
          )}
        >
          {isSubmitting ? "Saving..." : "Start workout"}
        </button>
      </div>
    </div>
  );
};

export default EnhancedReadinessCheckIn;