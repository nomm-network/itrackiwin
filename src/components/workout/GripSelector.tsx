import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useGrips } from '@/hooks/useGrips';
import { cn } from '@/lib/utils';

interface GripSelectorProps {
  selectedGrip: string | null;
  onGripChange: (grip: string | null) => void;
  exerciseId?: string;
  allowsGrips?: boolean;
  className?: string;
}

export const GripSelector: React.FC<GripSelectorProps> = ({
  selectedGrip,
  onGripChange,
  exerciseId,
  allowsGrips = true,
  className
}) => {
  const { data: grips, isLoading } = useGrips();

  if (!allowsGrips || isLoading || !grips) {
    return null;
  }

  // Common grips for most exercises
  const commonGrips = grips.filter(grip => 
    ['neutral', 'supinated', 'pronated', 'hammer', 'mixed'].includes(grip.slug)
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm font-medium text-muted-foreground">Grip</div>
      <div className="flex gap-2 flex-wrap">
        {commonGrips.map((grip) => (
          <Badge
            key={grip.id}
            variant={selectedGrip === grip.slug ? "default" : "outline"}
            className="cursor-pointer transition-colors hover:bg-primary/20"
            onClick={() => onGripChange(selectedGrip === grip.slug ? null : grip.slug)}
          >
            {grip.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default GripSelector;