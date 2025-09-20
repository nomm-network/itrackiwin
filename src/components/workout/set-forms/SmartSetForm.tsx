// workout-flow-v0.8.0 (SOT) – Form router (old look preserved)
'use client';

import BodyweightSetForm from './BodyweightSetForm';
import WeightRepsSetForm from './WeightRepsSetForm';
import CardioSetForm from './CardioSetForm';

type Props = {
  workoutId: string;
  workoutExercise: any;
  onSetLogged: () => void;
};

export default function SmartSetForm({ workoutId, workoutExercise, onSetLogged }: Props) {
  const effort = workoutExercise?.exercise?.effort_mode;
  const load = workoutExercise?.exercise?.load_mode;

  const type: 'bodyweight' | 'weightReps' | 'cardio' = (() => {
    if (effort === 'time' || effort === 'distance' || effort === 'calories') return 'cardio';
    if (load === 'bodyweight_plus_optional' || load === 'external_assist') return 'bodyweight';
    return 'weightReps';
  })();

  switch (type) {
    case 'bodyweight':
      return <BodyweightSetForm workoutId={workoutId} ex={workoutExercise} onSetLogged={onSetLogged} />;
    case 'cardio':
      return <CardioSetForm workoutId={workoutId} ex={workoutExercise} onSetLogged={onSetLogged} />;
    case 'weightReps':
    default:
      return <WeightRepsSetForm workoutId={workoutId} ex={workoutExercise} onSetLogged={onSetLogged} />;
  }
}