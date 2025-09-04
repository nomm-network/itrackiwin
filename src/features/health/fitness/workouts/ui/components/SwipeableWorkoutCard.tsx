import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, MoreHorizontal, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableWorkoutCardProps {
  children: React.ReactNode;
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isCompleted?: boolean;
  className?: string;
}

const SwipeableWorkoutCard: React.FC<SwipeableWorkoutCardProps> = ({
  children,
  onComplete,
  onEdit,
  onDelete,
  isCompleted = false,
  className
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const SWIPE_THRESHOLD = 60;
  const MAX_TRANSLATE = 120;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    
    // Only allow left swipe
    if (deltaX < 0) {
      const newTranslateX = Math.max(deltaX, -MAX_TRANSLATE);
      setTranslateX(newTranslateX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const deltaX = currentX.current - startX.current;
    
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      setTranslateX(-MAX_TRANSLATE);
      setIsRevealed(true);
    } else {
      setTranslateX(0);
      setIsRevealed(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;
    
    if (deltaX < 0) {
      const newTranslateX = Math.max(deltaX, -MAX_TRANSLATE);
      setTranslateX(newTranslateX);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const deltaX = currentX.current - startX.current;
    
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      setTranslateX(-MAX_TRANSLATE);
      setIsRevealed(true);
    } else {
      setTranslateX(0);
      setIsRevealed(false);
    }
  };

  const resetSwipe = () => {
    setTranslateX(0);
    setIsRevealed(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        resetSwipe();
      }
    };

    if (isRevealed) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isRevealed]);

  return (
    <div ref={cardRef} className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Action Buttons (behind the card) */}
      <div className="absolute inset-y-0 right-0 flex items-center bg-muted">
        {onComplete && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              onComplete();
              resetSwipe();
            }}
            className={cn(
              "h-full w-12 rounded-none transition-colors",
              isCompleted
                ? "text-green-600 hover:bg-green-100"
                : "text-blue-600 hover:bg-blue-100"
            )}
          >
            <Check className="h-5 w-5" />
          </Button>
        )}
        {onEdit && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              onEdit();
              resetSwipe();
            }}
            className="h-full w-12 rounded-none text-orange-600 hover:bg-orange-100"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              onDelete();
              resetSwipe();
            }}
            className="h-full w-12 rounded-none text-red-600 hover:bg-red-100"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Main Card Content */}
      <Card
        className={cn(
          "transition-transform duration-200 ease-out border-0 shadow-sm",
          isCompleted && "opacity-75"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {children}
            </div>
            <div className="flex items-center gap-2 ml-4">
              {/* Swipe indicator */}
              {!isRevealed && (
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwipeableWorkoutCard;