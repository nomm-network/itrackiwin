// WorkoutDebugBox.tsx
import React, {useMemo, useState} from 'react';
import { WORKOUT_FLOW_VERSION } from '@/constants/workoutFlow';

type Props = {
  anchor?: 'top' | 'bottom';
  // Anything you want to show; we'll also auto-detect workout id from URL
  data?: Record<string, any> | null;
};

const baseBox: React.CSSProperties = {
  width: '100%',
  background: 'rgba(220, 38, 38, 0.95)', // red
  color: '#fff',
  borderRadius: 10,
  padding: 10,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  border: '1px solid rgba(255,255,255,0.15)',
  marginBottom: 16,
};

const headerRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  marginBottom: 6,
};

const pill: React.CSSProperties = {
  background: 'rgba(255,255,255,0.15)',
  borderRadius: 6,
  padding: '2px 8px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: 'none',
  color: '#fff',
  cursor: 'pointer'
};

export default function WorkoutDebugBox({ anchor = 'top', data }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const urlPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
  const urlId = useMemo(() => {
    try {
      const parts = (typeof window !== 'undefined' ? window.location.pathname : '').split('/');
      return parts[parts.length - 1] || null;
    } catch {
      return null;
    }
  }, []);

  const safeData = useMemo(() => {
    const base = {
      version: WORKOUT_FLOW_VERSION,
      routerPath: urlPath,
      workoutId: data?.workoutId ?? data?.workout?.id ?? urlId ?? null,
      templateId: data?.templateId ?? data?.workout?.template_id ?? null,
      title: data?.title ?? data?.workout?.title ?? data?.workout?.name ?? null,
      readiness: data?.readiness ?? data?.workout?.readiness_score ?? null,
      exerciseCount:
        Array.isArray(data?.workout?.exercises) ? data!.workout!.exercises.length :
        Array.isArray((data as any)?.exercises) ? (data as any).exercises.length :
        null,
      sourceHint:
        Array.isArray(data?.workout?.exercises) ? 'rpc' :
        Array.isArray((data as any)?.exercises) ? 'rest' : 'unknown',
    };
    return base;
  }, [data, urlPath, urlId]);

  const json = useMemo(() => {
    try { return JSON.stringify(safeData, null, 2); }
    catch { return '{}'; }
  }, [safeData]);

  const style: React.CSSProperties = {
    ...baseBox,
  };

  return (
    <div style={style}>
      <div style={headerRow}>
        <strong>DEBUG • {WORKOUT_FLOW_VERSION}</strong>
        <span>• workoutId:</span>
        <span style={{fontWeight: 700}}>{safeData.workoutId ?? '—'}</span>
        <button style={pill} onClick={() => setCollapsed(v => !v)}>
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
        <button style={pill} onClick={() => window.location.reload()}>Refresh</button>
        <button
          style={pill}
          onClick={async () => {
            try { await navigator.clipboard.writeText(json); alert('Debug copied'); }
            catch (e) { console.error(e); }
          }}
        >
          Copy
        </button>
      </div>
      {!collapsed && (
        <pre style={{margin: 0, whiteSpace: 'pre-wrap'}}>{json}</pre>
      )}
    </div>
  );
}