// v108-SOT — DO NOT DUPLICATE
if (typeof window !== 'undefined') {
  console.log('[v108] Mounted: WorkoutDebugBox');
}

import React from 'react';

export default function WorkoutDebugBox({ version, context, data }: {
  version: string; context: string; data: any
}) {
  if (typeof window !== 'undefined') {
    console.log('[v108] DebugBox', { version, context, data });
  }
  return (
    <div style={{
      position: 'fixed', bottom: 8, left: 8, zIndex: 99999,
      background: '#B00020', color: '#fff',
      padding: '8px 10px', borderRadius: 6,
      fontFamily: 'monospace', fontSize: 12, maxWidth: '92vw', opacity: 0.95
    }}>
      <div><strong>DEBUG {version}</strong> — {context}</div>
      <pre style={{whiteSpace:'pre-wrap', margin: 0}}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

// removed duplicate export