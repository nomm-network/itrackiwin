import React, { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { SetFeelSelector } from '@/features/health/fitness/components/SetFeelSelector';

interface SetData {
  id?: string;
  weight?: number;
  reps?: number;
  rpe?: number;
  feel?: string;
  set_index?: number;
  is_completed?: boolean;
}

interface SwipeableSetRowProps {
  set: SetData;
  onFeelChange?: (setId: string, feel: string) => void;
  className?: string;
}

export const SwipeableSetRow: React.FC<SwipeableSetRowProps> = ({
  set,
  onFeelChange,
  className
}) => {
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [showFeelPicker, setShowFeelPicker] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout>();
  const touchStartTimeRef = useRef<number>(0);

  const handleTouchStart = () => {
    touchStartTimeRef.current = Date.now();
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressed(true);
      setShowFeelPicker(true);
      // Haptic feedback (if supported)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    
    const touchDuration = Date.now() - touchStartTimeRef.current;
    if (touchDuration < 500) {
      setIsLongPressed(false);
    }
  };

  const handleFeelSelect = (feel: string) => {
    if (set.id) {
      onFeelChange?.(set.id, feel);
    }
    setShowFeelPicker(false);
    setIsLongPressed(false);
  };

  return (
    <Popover open={showFeelPicker} onOpenChange={setShowFeelPicker}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-lg transition-all duration-200",
            "bg-muted/30 hover:bg-muted/50 cursor-pointer touch-target",
            isLongPressed && "bg-primary/10 scale-98",
            className
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none'
          }}
        >
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              Set {set.set_index}
            </Badge>
            <span className="font-medium">
              {set.weight}kg × {set.reps} reps
            </span>
            {set.rpe && (
              <Badge variant="secondary" className="text-xs">
                RPE {set.rpe}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {set.feel && (
              <Badge variant="outline" className="text-xs">
                {set.feel}
              </Badge>
            )}
            <div className="text-xs text-muted-foreground">
              Hold to rate
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="top" align="center">
        <SetFeelSelector
          setId={set.id || ''}
          currentFeel={set.feel as any}
          onFeelChange={handleFeelSelect}
        />
      </PopoverContent>
    </Popover>
  );
};