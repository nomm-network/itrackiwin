// workouts-sot/components/sets/BodyweightSetForm.tsx
// v111.8 – bodyweight(+added/–assist) switcher; non-breaking; same look & spacing

import * as React from "react";
import { useMemo, useState } from "react";

// Re-use your UI atoms (same ones used by current form)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useWorkoutSetGrips } from '@/hooks/useWorkoutSetGrips';
import { useToast } from '@/hooks/use-toast';
import { buildSupabaseErrorMessage } from '@/workouts-sot/utils/supabaseError';

// ---- Types kept loose to avoid breaking callers ----
type SubmitPayload = {
  reps: number;
  weight: number; // external load only; 0 for pure bodyweight; negative for assist
  rpe?: number;
  feel?: string;
  notes?: string;
  pain?: boolean;
};

type Props = {
  // existing props seen in your codebase (support both handlers)
  unit?: "kg" | "lb";
  templateTargetReps?: number | null;

  // one of these will exist depending on caller
  onSubmit?: (data: SubmitPayload) => void;
  onSetComplete?: (data: SubmitPayload) => void;

  // SmartSetForm compatibility props
  workoutExerciseId?: string;
  exercise?: any;
  setIndex?: number;
  currentSetNumber?: number; // Add this for bodyweight sets
  onLogged?: () => void;

  // keep these to avoid TS noise if parent passes them
  className?: string;
};

// ---- Helper to normalize a numeric input (empty => 0) ----
const toNumber = (v: string | number) => {
  if (typeof v === "number") return v;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

type Mode = "bodyweight" | "added" | "assisted";

export default function BodyweightSetForm({
  unit = "kg",
  templateTargetReps,
  onSubmit,
  onSetComplete,
  onLogged,
  workoutExerciseId,
  currentSetNumber = 1,
  className,
}: Props) {
  const [mode, setMode] = useState<Mode>("bodyweight");
  const { saveSetWithGrips, isLoading } = useWorkoutSetGrips();
  const { toast } = useToast();

  // Inputs
  const [reps, setReps] = useState<string>(
    templateTargetReps ? String(templateTargetReps) : "8"
  );
  const [added, setAdded] = useState<string>("0");
  const [assist, setAssist] = useState<string>("0");

  // Optional extras (kept but not rendered to avoid UI changes)
  const [notes] = useState<string>("");
  const [rpe] = useState<number | undefined>(undefined);
  const [feel] = useState<string | undefined>(undefined);
  const [pain] = useState<boolean | undefined>(undefined);

  // Effective external load to send to logger
  const effectiveWeight = useMemo(() => {
    if (mode === "bodyweight") return 0;
    if (mode === "added") return toNumber(added);
    // assisted
    return -Math.abs(toNumber(assist));
  }, [mode, added, assist]);

  // Human readout shown in the grey total line (same block you already have)
  const totalLine = useMemo(() => {
    if (mode === "bodyweight") return "Total Load: Bodyweight";
    if (mode === "added")
      return `Total Load: Bodyweight + ${Math.max(0, toNumber(added))}${unit}`;
    return `Total Load: Bodyweight – ${Math.max(0, toNumber(assist))}${unit}`;
  }, [mode, added, assist, unit]);

  const disabled = toNumber(reps) <= 0;

  const fireSubmit = async () => {
    const payload: SubmitPayload = {
      reps: Math.max(0, Math.floor(toNumber(reps))),
      weight: effectiveWeight,
      rpe,
      feel,
      notes,
      pain,
    };

    const setData: any = {
      workout_exercise_id: workoutExerciseId,
      reps: payload.reps,
      is_completed: true
    };

    // Only add weight if it's not bodyweight mode
    if (mode !== 'bodyweight' && effectiveWeight !== 0) {
      setData.weight = effectiveWeight;
      setData.weight_unit = 'kg';
    }

    console.log('🔥 BodyweightSetForm v111.8: DETAILED LOGGING START');
    console.log('🔥 Mode:', mode);
    console.log('🔥 Effective Weight:', effectiveWeight);
    console.log('🔥 Final setData payload being sent to saveSetWithGrips:', JSON.stringify(setData, null, 2));
    console.log('🔥 workoutExerciseId:', workoutExerciseId);

    try {
      const result = await saveSetWithGrips(setData);
      console.log('🔥 saveSetWithGrips SUCCESS result:', result);

      // ✅ success toast only after await resolves
      toast({
        title: "Set Logged Successfully",
        description: `${totalLine.replace('Total Load: ', '')} × ${payload.reps} reps`,
      });

      // prefer onSubmit; fallback to onSetComplete (both exist in codebase)
      if (onSubmit) {
        console.log('🔥 Calling onSubmit callback');
        onSubmit(payload);
      } else if (onSetComplete) {
        console.log('🔥 Calling onSetComplete callback');
        onSetComplete(payload);
      }
      
      // Call onLogged callback to notify parent of completion
      if (onLogged) {
        console.log('🔥 Calling onLogged callback');
        onLogged();
      }

    } catch (error) {
      console.error('❌ BodyweightSetForm: CRITICAL ERROR in saveSetWithGrips:', error);
      
      // ❌ show the exact DB error
      const msg = buildSupabaseErrorMessage(error, 'FormSubmit');
      toast({
        variant: "destructive",
        title: "SET SAVE FAILED",
        description: msg,
      });

      if ((error as any)?.raw) {
        // raw PostgREST / SQL object for operators
        // eslint-disable-next-line no-console
        console.error('🔴 raw DB error:', (error as any).raw);
      }
    }
  };

  return (
    <div className={cn("rounded-xl border border-white/10 bg-[#0f1317] p-5", className)}>
      {/* Title row kept minimal to preserve current spacing */}
      <div className="mb-4 text-lg font-medium">Dips</div>

      {/* --- Mode switcher (keeps your spacing; pill buttons) --- */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className={pillCls(mode === "bodyweight")}
          onClick={() => setMode("bodyweight")}
        >
          Bodyweight
        </button>
        <button
          type="button"
          className={pillCls(mode === "added")}
          onClick={() => setMode("added")}
        >
          + Added
        </button>
        <button
          type="button"
          className={pillCls(mode === "assisted")}
          onClick={() => setMode("assisted")}
        >
          – Assisted
        </button>
      </div>

      {/* --- Reps (required) --- */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block">Reps *</Label>
          <Input
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="8"
            className="text-base"
          />
        </div>

        {/* Weight input only when needed; same Input component for look parity */}
        {mode === "added" && (
          <div>
            <Label className="mb-2 block">Added ({unit})</Label>
            <Input
              inputMode="numeric"
              value={added}
              onChange={(e) => setAdded(e.target.value)}
              placeholder="0"
              className="text-base"
            />
          </div>
        )}
        {mode === "assisted" && (
          <div>
            <Label className="mb-2 block">Assist ({unit})</Label>
            <Input
              inputMode="numeric"
              value={assist}
              onChange={(e) => setAssist(e.target.value)}
              placeholder="0"
              className="text-base"
            />
          </div>
        )}
      </div>

      {/* --- Grey readout (same block you already show) --- */}
      <div className="mb-4 rounded-lg bg-white/5 px-4 py-3 text-[15px]">
        {totalLine}
      </div>

      <Button
        size="lg"
        className="w-full text-base"
        disabled={disabled || isLoading}
        onClick={fireSubmit}
      >
        {isLoading ? 'Logging...' : `Log Set ${currentSetNumber}`}
      </Button>
    </div>
  );
}

// Small helper to keep the same "pill" look you already use in headers
function pillCls(active: boolean) {
  return cn(
    "px-3 py-1.5 rounded-md border text-sm",
    active
      ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-200"
      : "bg-white/5 border-white/10 text-white/80"
  );
}
