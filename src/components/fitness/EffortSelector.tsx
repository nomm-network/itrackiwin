import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type EffortLevel = 'very_easy' | 'easy' | 'moderate' | 'hard' | 'very_hard';

interface EffortSelectorProps {
  onEffortSelect: (effort: EffortLevel) => void;
  onPainReport: () => void;
  selectedEffort?: EffortLevel;
  className?: string;
}

const effortOptions: Array<{
  value: EffortLevel;
  label: string;
  symbol: string;
  description: string;
  color: string;
}> = [
  {
    value: 'very_easy',
    label: 'Very Easy',
    symbol: '++',
    description: 'Could do many more reps',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    value: 'easy',
    label: 'Easy',
    symbol: '+',
    description: 'Could do several more reps',
    color: 'bg-green-400 hover:bg-green-500'
  },
  {
    value: 'moderate',
    label: 'Moderate',
    symbol: '=',
    description: 'Could do 2-3 more reps',
    color: 'bg-yellow-500 hover:bg-yellow-600'
  },
  {
    value: 'hard',
    label: 'Hard',
    symbol: '-',
    description: 'Could do 1 more rep',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    value: 'very_hard',
    label: 'Very Hard',
    symbol: '--',
    description: 'Maximal effort',
    color: 'bg-red-500 hover:bg-red-600'
  }
];

const EffortSelector: React.FC<EffortSelectorProps> = ({
  onEffortSelect,
  onPainReport,
  selectedEffort,
  className
}) => {
  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-center">How did that feel?</h3>
        
        <div className="grid grid-cols-5 gap-2">
          {effortOptions.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              onClick={() => onEffortSelect(option.value)}
              className={cn(
                "flex flex-col items-center p-2 h-auto transition-all",
                selectedEffort === option.value && "ring-2 ring-primary",
                option.color.replace('bg-', 'hover:bg-').replace('hover:bg-', 'hover:bg-')
              )}
            >
              <span className="text-lg font-bold text-white">{option.symbol}</span>
              <span className="text-xs text-white">{option.label}</span>
            </Button>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="destructive"
            size="sm"
            onClick={onPainReport}
            className="bg-red-600 hover:bg-red-700"
          >
            ⚠️ Pain
          </Button>
        </div>

        {selectedEffort && (
          <p className="text-xs text-muted-foreground text-center">
            {effortOptions.find(opt => opt.value === selectedEffort)?.description}
          </p>
        )}
      </div>
    </Card>
  );
};

export default EffortSelector;