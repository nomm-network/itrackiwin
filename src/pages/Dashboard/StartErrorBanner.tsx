import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type StartErr = { code: string; message: string; details?: any; hint?: any };

export const StartErrorBanner: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [err, setErr] = useState<StartErr | null>(null);

  useEffect(() => {
    if (searchParams.get('startError') === '1') {
      const raw = sessionStorage.getItem('lastStartError');
      if (raw) {
        try {
          setErr(JSON.parse(raw));
        } catch {
          // ignore
        }
      }
      // remove the query param so it doesn't stick around
      searchParams.delete('startError');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  if (!err) return null;

  return (
    <Card className="border-destructive bg-destructive/10 mb-4">
      <CardContent className="p-4">
        <div className="font-semibold text-destructive mb-2">
          Start workout failed
        </div>
        <pre className="text-sm bg-background/50 p-3 rounded text-foreground whitespace-pre-wrap overflow-auto max-h-48">
{JSON.stringify(err, null, 2)}
        </pre>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(err, null, 2));
              toast.success('Error copied to clipboard');
            }}
          >
            Copy error
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              sessionStorage.removeItem('lastStartError');
              setErr(null);
            }}
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};