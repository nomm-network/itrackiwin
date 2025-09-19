import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeelSelectorProps {
  selectedFeel: string | null;
  onFeelChange: (feel: string | null) => void;
  className?: string;
}

const feelOptions = [
  { emoji: '😣', value: 'terrible', label: 'Terrible' },
  { emoji: '😞', value: 'bad', label: 'Bad' },
  { emoji: '😐', value: 'okay', label: 'Okay' },
  { emoji: '🙂', value: 'good', label: 'Good' },
  { emoji: '😎', value: 'amazing', label: 'Amazing' },
];

export const FeelSelector: React.FC<FeelSelectorProps> = ({
  selectedFeel,
  onFeelChange,
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm font-medium text-muted-foreground">How did that feel?</div>
      <div className="flex gap-2 justify-between">
        {feelOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={selectedFeel === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onFeelChange(selectedFeel === option.value ? null : option.value)}
            className="flex-1 h-12 flex-col gap-1"
          >
            <span className="text-lg">{option.emoji}</span>
            <span className="text-xs">{option.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FeelSelector;