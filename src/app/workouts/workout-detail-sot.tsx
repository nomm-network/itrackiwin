import { useParams } from 'react-router-dom';
import { useGetWorkout } from '@/workouts-sot/hooks';
import { EnhancedWorkoutSession } from '@/workouts-sot/components/session';

// Log component mount for verification
console.log('WorkoutPage mounted • v112.0-LEGACY-MINI-MENU-ACTIVATED');
console.log('📁 [WorkoutPage] SOT File Path: src/app/workouts/workout-detail-sot.tsx');
console.log('📁 [WorkoutPage] SOT Hook: @/workouts-sot/hooks/useGetWorkout');
console.log('📁 [WorkoutPage] SOT Session: @/workouts-sot/components/session/EnhancedWorkoutSession (LEGACY-MINI-MENU)');

// ——— DEBUG v112.0: Legacy mini-menu with warmup/grips/feel ———
const __DEBUG_VERSION = 'v112.11-DETAILED-ERROR-MSGS-' + Date.now();

function DebugTop({ payload }: { payload: any }) {
  const json = (() => {
    try { return JSON.stringify({ version: __DEBUG_VERSION, ...payload }, null, 2); }
    catch { return '{}'; }
  })();

  return (
    <div
      style={{
        margin: '12px',
        marginTop: 0,
        borderRadius: 10,
        background: '#a61b1b',
        color: '#fff',
        padding: 10,
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace',
        fontSize: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
        <strong>DEBUG • {__DEBUG_VERSION}</strong>
        <span style={{ opacity: 0.85 }}>
          • route:&nbsp;
          {typeof window !== 'undefined' ? window.location.pathname + window.location.search : 'SSR'}
        </span>
        <button
          onClick={() => window.location.reload()}
          style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}
        >
          Refresh
        </button>
        <button
          onClick={async () => {
            try { await navigator.clipboard.writeText(json); alert('Debug copied'); } catch {}
          }}
          style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}
        >
          Copy
        </button>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{json}</pre>
    </div>
  );
}
// ——— /DEBUG helper ———

export default function WorkoutPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const { data: workout, isLoading, isError, error } = useGetWorkout(workoutId);

  console.log('[WorkoutPage] id param:', workoutId);
  console.log('[WorkoutPage] query state:', { isLoading, isError, hasData: !!workout });

  // Build minimal payload for debug
  const __debugPayload = {
    workoutId,
    isLoading,
    isError,
    hasWorkout: !!workout,
    workoutData: workout ? {
      id: workout.id,
      title: workout.title,
      template_id: workout.template_id,
      exercises: workout.exercises?.length || 0
    } : null,
    errorMessage: error ? (error as any)?.message : null,
    sotFiles: {
      currentFile: 'src/app/workouts/workout-detail-sot.tsx',
      hookFile: '@/workouts-sot/hooks/useGetWorkout',
      componentFile: '@/workouts-sot/components/session/EnhancedWorkoutSession (SOT-ONLY)',
      setFormFile: '@/workouts-sot/components/sets/SmartSetForm (SOT-ONLY)',
      apiFile: '@/workouts-sot/api/workouts-api.ts'
    }
  };

  if (isLoading) {
    return (
      <>
        <DebugTop payload={__debugPayload} />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading workout...</span>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <DebugTop payload={__debugPayload} />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Failed to load workout</h2>
            <p className="text-muted-foreground">{(error as any)?.message}</p>
          </div>
        </div>
      </>
    );
  }

  if (!workout) {
    return (
      <>
        <DebugTop payload={__debugPayload} />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Workout not found</h2>
            <p className="text-muted-foreground">This workout doesn't exist or you don't have access to it.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DebugTop payload={__debugPayload} />
      <EnhancedWorkoutSession workout={workout} />
    </>
  );
}