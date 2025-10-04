import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

const DEBUG_VERSION = 'v2.1';

export function DebugPanel() {
  const [errors, setErrors] = useState<string[]>([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Listen for custom error events
    const handleError = (e: any) => {
      const errorMsg = e.detail?.message || e.detail || 'Unknown error';
      setErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: ${errorMsg}`]);
    };

    window.addEventListener('debug-error', handleError);
    return () => window.removeEventListener('debug-error', handleError);
  }, []);

  if (!show) return null;

  return (
    <Card className="fixed bottom-4 right-4 p-4 bg-red-950/90 border-red-500 text-white max-w-md z-50">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold">DEBUG PANEL {DEBUG_VERSION}</div>
        <button onClick={() => setShow(false)} className="hover:bg-red-800 p-1 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="text-xs space-y-1 max-h-48 overflow-y-auto">
        {errors.length === 0 ? (
          <div className="text-red-300">No errors yet. Waiting for workout start...</div>
        ) : (
          errors.map((err, i) => (
            <div key={i} className="border-b border-red-800 pb-1 mb-1">
              {err}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
