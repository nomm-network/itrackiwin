import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Grip, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HandleGripBadgesProps {
  selectedHandleId?: string;
  selectedGripIds?: string[];
  handleName?: string;
  gripNames?: string[];
  onRemoveHandle?: () => void;
  onRemoveGrip?: (gripId: string) => void;
  onEditClick?: () => void;
  className?: string;
  showEdit?: boolean;
  compact?: boolean;
}

export function HandleGripBadges({
  selectedHandleId,
  selectedGripIds = [],
  handleName,
  gripNames = [],
  onRemoveHandle,
  onRemoveGrip,
  onEditClick,
  className,
  showEdit = false,
  compact = false
}: HandleGripBadgesProps) {
  const hasSelection = selectedHandleId || selectedGripIds.length > 0;

  if (!hasSelection && !showEdit) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {/* Handle Badge */}
      {selectedHandleId && handleName && (
        <Badge variant="default" className={cn("text-xs", compact && "text-[10px] px-1.5 py-0.5")}>
          <Grip className="h-3 w-3 mr-1" />
          {handleName}
          {onRemoveHandle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveHandle();
              }}
              className="h-auto p-0 ml-1 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Badge>
      )}

      {/* Grip Badges */}
      {selectedGripIds.map((gripId, index) => {
        const gripName = gripNames[index] || `Grip ${index + 1}`;
        return (
          <Badge 
            key={gripId} 
            variant="secondary" 
            className={cn("text-xs", compact && "text-[10px] px-1.5 py-0.5")}
          >
            {gripName}
            {onRemoveGrip && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveGrip(gripId);
                }}
                className="h-auto p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Badge>
        );
      })}

      {/* Edit Button */}
      {showEdit && onEditClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEditClick}
          className={cn(
            "text-xs", 
            compact && "text-[10px] px-2 py-1 h-auto",
            !hasSelection && "text-muted-foreground border-dashed"
          )}
        >
          <Grip className="h-3 w-3 mr-1" />
          {hasSelection ? 'Edit' : 'Add Handle/Grip'}
        </Button>
      )}
    </div>
  );
}