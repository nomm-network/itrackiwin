import { useEffect, useRef, useState } from 'react';

export function useSessionTimer() {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    ref.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return { elapsedLabel: `${mm}:${ss}`, seconds };
}