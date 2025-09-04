import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useStartWorkout } from '../hooks';

const TrainingLauncher: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutateAsync: startWorkout } = useStartWorkout();
  const didStartRef = useRef(false);

  useEffect(() => {
    if (didStartRef.current) return;
    didStartRef.current = true;

    const templateId = searchParams.get('templateId') || undefined;

    startWorkout({ templateId })
      .then(({ workoutId }) => navigate(`/app/workouts/${workoutId}`))
      .catch((e) => {
        const msg = e?.message || e?.error_description || JSON.stringify(e);
        console.error('[TrainingLauncher] start_workout failed', e);
        toast.error(`Start failed: ${msg}`);
        navigate('/dashboard');
      });
  }, [searchParams, startWorkout, navigate]);

  return null;
};

export default TrainingLauncher;