import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type Props = { templateId?: string; children?: React.ReactNode };

function formatSupabaseError(err: any) {
  // Supabase RPC errors typically have: code, message, details, hint
  const { code, message, details, hint } = err ?? {};
  return {
    code: code ?? 'UNKNOWN',
    message: message ?? String(err),
    details: details ?? null,
    hint: hint ?? null,
  };
}

export const StartWithDebug: React.FC<Props> = ({ templateId, children }) => {
  const navigate = useNavigate();

  const handleStart = async () => {
    // Clear any prior error
    sessionStorage.removeItem('lastStartError');

    const { data, error } = await supabase.rpc('start_workout', {
      p_template_id: templateId ?? null,
    });

    if (error) {
      const e = formatSupabaseError(error);

      // 1) Log full error to console
      //    (So dev tools show the real payload & stack)
      // eslint-disable-next-line no-console
      console.error('[start_workout] FAILED:', e, error);

      // 2) Show full error in a sticky toast (copyable)
      toast.error(
        <div style={{ maxWidth: 420, wordBreak: 'break-word' }}>
          <b>Start workout failed</b>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
{JSON.stringify(e, null, 2)}
          </pre>
        </div>,
        { duration: 8000 }
      );

      // 3) Persist error so Dashboard can show it too
      sessionStorage.setItem('lastStartError', JSON.stringify(e));

      // 4) Navigate anyway (optional). If you prefer to *not* navigate on error,
      //    comment out the line below.
      navigate('/dashboard?startError=1');
      return;
    }

    // Success: navigate to the workout
    navigate(`/app/workouts/${data}`);
  };

  return (
    <button onClick={handleStart} className="btn btn-primary">
      {children ?? 'Start'}
    </button>
  );
};