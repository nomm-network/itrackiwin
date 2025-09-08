import React, { useState, useEffect } from 'react';
import { getReadinessScoreColor, getReadinessScoreDescription } from '@/lib/readiness';

interface SessionHeaderMetaProps {
  readiness?: number;
  startedAt?: string | Date;
  endedAt?: string | Date;
}

export function SessionHeaderMeta({
  readiness,
  startedAt,
  endedAt,
}: SessionHeaderMetaProps) {
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    if (!startedAt || endedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt, endedAt]);

  const durMs = startedAt ? (endedAt ? +new Date(endedAt) : now) - +new Date(startedAt) : 0;
  const mm = Math.floor(durMs / 60000);
  const ss = Math.floor((durMs % 60000) / 1000);
  const timeStr = `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;

  return (
    <div className="flex items-center gap-2">
      {typeof readiness === 'number' && (
        <div className="relative w-9 h-9 rounded-full grid place-items-center"
             aria-label={`Readiness ${readiness}/10 - ${getReadinessScoreDescription(readiness)}`}
             title={`Readiness: ${getReadinessScoreDescription(readiness)} (${Math.round(readiness)}/10)`}>
          {/* Circular progress ring */}
          <svg viewBox="0 0 36 36" className="absolute inset-0 w-9 h-9">
            <circle 
              cx="18" 
              cy="18" 
              r="16" 
              fill="none" 
              stroke="hsl(var(--muted-foreground) / 0.3)" 
              strokeWidth="3" 
            />
            <circle 
              cx="18" 
              cy="18" 
              r="16" 
              fill="none"
              stroke={readiness >= 80 ? "hsl(var(--success))" : 
                     readiness >= 60 ? "hsl(var(--warning))" : 
                     readiness >= 40 ? "hsl(var(--orange))" : 
                     "hsl(var(--destructive))"} 
              strokeWidth="3"
              strokeDasharray={`${Math.max(4, Math.min(100, readiness)) * 1.005}, 120`}
              className="transition-all duration-300"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <span className={`text-xs font-semibold relative z-10 ${getReadinessScoreColor(readiness)}`}>
            {Math.round(readiness)}
          </span>
        </div>
      )}
      <div className="px-2 py-1 rounded-md text-sm bg-muted/50 text-muted-foreground border">
        ⏱ {timeStr}
      </div>
    </div>
  );
}