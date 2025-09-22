import { useEffect, useState } from "react";
import { useSessionTiming } from "@/stores/sessionTiming";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function RestTimerPill() {
  const { restStartedAt, startRest, stopRest, resetRest } = useSessionTiming();
  const [tick, setTick] = useState(0);

  // tick to display live time
  useEffect(() => {
    if (!restStartedAt) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [restStartedAt]);

  const seconds = Math.floor(((restStartedAt ? Date.now() - restStartedAt : 0) / 1000));
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-secondary/50 border border-border rounded-full text-xs">
      <span className="text-muted-foreground">⏱</span>
      <span className="font-mono min-w-[40px]">
        {minutes}:{secs.toString().padStart(2, '0')}
      </span>
      <div className="flex gap-1">
        {restStartedAt ? (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 w-5 p-0 hover:bg-background/50"
              onClick={stopRest}
              aria-label="Pause rest"
            >
              <Pause className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 w-5 p-0 hover:bg-background/50"
              onClick={resetRest}
              aria-label="Reset rest"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0 hover:bg-background/50"
            onClick={startRest}
            aria-label="Start rest"
          >
            <Play className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}