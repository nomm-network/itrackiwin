import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeToCompleteSetProps {
  onComplete: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  swipeThreshold?: number;
}

export const SwipeToCompleteSet: React.FC<SwipeToCompleteSetProps> = ({
  onComplete,
  onCancel,
  children,
  disabled = false,
  className,
  swipeThreshold = 120
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwipingRight, setIsSwipingRight] = useState(false);
  const [isSwipingLeft, setIsSwipingLeft] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);

  const handleStart = (clientX: number) => {
    if (disabled) return;
    setIsDragging(true);
    startXRef.current = clientX;
    lastXRef.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled) return;
    
    const deltaX = clientX - startXRef.current;
    const maxSwipe = 150;
    const constrainedX = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    
    setTranslateX(constrainedX);
    setIsSwipingRight(constrainedX > 30);
    setIsSwipingLeft(constrainedX < -30);
    lastXRef.current = clientX;
  };

  const handleEnd = () => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    
    if (translateX >= swipeThreshold) {
      // Swipe right to complete
      onComplete();
      setTranslateX(0);
    } else if (translateX <= -swipeThreshold && onCancel) {
      // Swipe left to cancel
      onCancel();
      setTranslateX(0);
    } else {
      // Snap back
      setTranslateX(0);
    }
    
    setIsSwipingRight(false);
    setIsSwipingLeft(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Add global mouse listeners when dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      handleEnd();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  const progress = Math.abs(translateX) / swipeThreshold;
  const progressPercent = Math.min(100, progress * 100);

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Background action indicators */}
      <div className="absolute inset-0 flex">
        {/* Complete action (right) */}
        <div 
          className={cn(
            "flex-1 flex items-center justify-start pl-4 transition-all duration-200",
            isSwipingRight 
              ? "bg-primary/20 text-primary" 
              : "bg-muted/10 text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Check className={cn(
              "h-5 w-5 transition-transform duration-200",
              progress > 0.5 && "scale-110"
            )} />
            <span className="text-fluid-sm font-medium">Complete Set</span>
          </div>
        </div>

        {/* Cancel action (left) */}
        {onCancel && (
          <div 
            className={cn(
              "flex-1 flex items-center justify-end pr-4 transition-all duration-200",
              isSwipingLeft 
                ? "bg-destructive/20 text-destructive" 
                : "bg-muted/10 text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-fluid-sm font-medium">Cancel</span>
              <X className={cn(
                "h-5 w-5 transition-transform duration-200",
                progress > 0.5 && "scale-110"
              )} />
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <Card
        ref={containerRef}
        className={cn(
          "relative transition-transform duration-200 select-none swipe-container",
          disabled && "opacity-50",
          isDragging && "duration-0"
        )}
        style={{
          transform: `translateX(${translateX}px)`,
          zIndex: 10
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent className="p-fluid-s">
          <div className="flex items-center justify-between">
            {children}
            
            {/* Swipe indicator */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <span className="text-xs">Swipe to complete</span>
            </div>
          </div>
          
          {/* Progress indicator */}
          {isDragging && (
            <div className="mt-2">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-100 rounded-full",
                    isSwipingRight ? "bg-primary" : isSwipingLeft ? "bg-destructive" : "bg-muted-foreground"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Haptic feedback simulation */}
      {progress > 0.8 && (
        <div className="absolute inset-0 pointer-events-none animate-pulse bg-primary/10 rounded-lg" />
      )}
    </div>
  );
};

export default SwipeToCompleteSet;