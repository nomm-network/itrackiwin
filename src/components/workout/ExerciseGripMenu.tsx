import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Hand, X } from 'lucide-react';
import { useGrips } from '@/hooks/useGrips';
import { cn } from '@/lib/utils';

interface ExerciseGripMenuProps {
  selectedGrip: string | null;
  onGripChange: (grip: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const ExerciseGripMenu: React.FC<ExerciseGripMenuProps> = ({
  selectedGrip,
  onGripChange,
  isOpen,
  onClose,
  className
}) => {
  const { data: grips, isLoading } = useGrips();

  if (!isOpen || isLoading || !grips) {
    return null;
  }

  // Common grips for most exercises
  const commonGrips = grips.filter(grip => 
    ['mixed', 'neutral', 'supinated', 'pronated', 'hammer'].includes(grip.slug)
  );

  return (
    <Card className={cn("border-0 shadow-none bg-muted/30", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">Grip</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {commonGrips.map((grip) => (
            <Button
              key={grip.id}
              variant={selectedGrip === grip.slug ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onGripChange(selectedGrip === grip.slug ? null : grip.slug);
              }}
              className="text-xs px-3 h-8"
            >
              {grip.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseGripMenu;