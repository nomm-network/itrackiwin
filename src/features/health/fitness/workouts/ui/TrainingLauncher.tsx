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

    console.log('[TrainingLauncher] Starting workout with templateId:', templateId);
    
    startWorkout({ templateId })
      .then((result) => {
        console.log('[TrainingLauncher] start_workout result:', result);
        const { workoutId } = result;
        
        if (!workoutId) {
          throw new Error('No workout ID returned from start_workout');
        }
        
        const targetUrl = `/app/workouts/${workoutId}`;
        console.log('[TrainingLauncher] Navigating to:', targetUrl);
        navigate(targetUrl);
      })
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