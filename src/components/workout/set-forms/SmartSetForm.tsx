// workout-flow-v1.0.0 (SOT) – DO NOT DUPLICATE
import BodyweightForm from './forms/BodyweightForm';
import WeightRepsForm from './forms/WeightRepsForm';
import CardioForm from './forms/CardioForm';

export default function SmartSetForm({
  exercise,
  onLogged,
}: {
  exercise: any;
  onLogged: () => void;
}) {
  const effort = exercise?.exercise?.effort_mode;
  const load = exercise?.exercise?.load_mode;

  const kind: 'bodyweight' | 'weight' | 'cardio' = (() => {
    if (effort === 'time' || effort === 'distance' || effort === 'calories') return 'cardio';
    if (load === 'bodyweight_plus_optional' || load === 'external_assist') return 'bodyweight';
    return 'weight';
  })();

  if (kind === 'cardio') return <CardioForm exercise={exercise} onLogged={onLogged} />;
  if (kind === 'bodyweight') return <BodyweightForm exercise={exercise} onLogged={onLogged} />;
  return <WeightRepsForm exercise={exercise} onLogged={onLogged} />;
}