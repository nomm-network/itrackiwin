// wf-step1: Cardio form skeleton (time/distance/calories)
import React, { useState } from 'react';

interface CardioSetFormProps {
  exercise: any;
  setIndex: number;
  onSubmit?: (payload: {
    duration_seconds?: number;
    distance?: number;
    settings?: Record<string, any>; // e.g. { calories: 120 }
    effort?: 'time' | 'distance' | 'calories';
    rpe?: number;
    notes?: string;
  }) => Promise<void>;
  [key: string]: any;
}

const CardioSetForm: React.FC<CardioSetFormProps> = ({ exercise, setIndex, onSubmit }) => {
  const effort: 'time' | 'distance' | 'calories' =
    exercise?.exercise?.effort_mode ?? 'time';

  const [duration, setDuration] = useState<number>(60);
  const [distance, setDistance] = useState<number>(1000);
  const [calories, setCalories] = useState<number>(50);

  const [rpe, setRpe] = useState<number | undefined>(undefined);

  const handleSubmit = async () => {
    if (!onSubmit) return;
    if (effort === 'time') {
      await onSubmit({ effort: 'time', duration_seconds: duration, rpe });
    } else if (effort === 'distance') {
      await onSubmit({ effort: 'distance', distance, rpe });
    } else {
      await onSubmit({ effort: 'calories', settings: { calories }, rpe });
    }
  };

  return (
    <div data-wf="wf-step1-cardio" className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground">Set {setIndex}</div>

      {effort === 'time' && (
        <div>
          <div className="text-sm text-muted-foreground mb-1">Duration (seconds)</div>
          <input
            type="number"
            inputMode="numeric"
            className="h-10 w-full rounded-md border bg-background px-3"
            value={duration}
            onChange={e => setDuration(Number(e.target.value || 0))}
            min={1}
          />
        </div>
      )}

      {effort === 'distance' && (
        <div>
          <div className="text-sm text-muted-foreground mb-1">Distance (m)</div>
          <input
            type="number"
            inputMode="numeric"
            className="h-10 w-full rounded-md border bg-background px-3"
            value={distance}
            onChange={e => setDistance(Number(e.target.value || 0))}
            min={1}
            step={10}
          />
        </div>
      )}

      {effort === 'calories' && (
        <div>
          <div className="text-sm text-muted-foreground mb-1">Calories</div>
          <input
            type="number"
            inputMode="numeric"
            className="h-10 w-full rounded-md border bg-background px-3"
            value={calories}
            onChange={e => setCalories(Number(e.target.value || 0))}
            min={1}
            step={1}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">RPE</div>
        {[4, 6, 8, 9].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setRpe(v)}
            className={`h-8 px-2 rounded-md border ${rpe === v ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
          >
            {v}
          </button>
        ))}
        <button type="button" onClick={() => setRpe(undefined)} className="h-8 px-2 rounded-md border">
          clear
        </button>
      </div>

      <div className="pt-2">
        <button type="button" onClick={handleSubmit} className="h-10 w-full rounded-md bg-primary text-primary-foreground">
          Log Set {setIndex}
        </button>
      </div>
    </div>
  );
};

export default CardioSetForm;