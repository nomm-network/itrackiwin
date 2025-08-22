import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EffortRating = -2 | -1 | 0 | 1 | 2;

interface EffortChipsProps {
  value?: EffortRating;
  onChange: (effort: EffortRating) => void;
  className?: string;
}

const effortOptions: Array<{
  value: EffortRating;
  symbol: string;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: 2,
    symbol: '++',
    label: 'Very Easy',
    description: 'Could do many more reps',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    value: 1,
    symbol: '+',
    label: 'Easy',
    description: 'Could do several more reps',
    color: 'bg-green-400 hover:bg-green-500'
  },
  {
    value: 0,
    symbol: '=',
    label: 'Moderate',
    description: 'Could do 2-3 more reps',
    color: 'bg-yellow-500 hover:bg-yellow-600'
  },
  {
    value: -1,
    symbol: '-',
    label: 'Hard',
    description: 'Could do 1 more rep',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    value: -2,
    symbol: '--',
    label: 'Very Hard',
    description: 'Maximal effort',
    color: 'bg-red-500 hover:bg-red-600'
  }
];

const EffortChips: React.FC<EffortChipsProps> = ({
  value,
  onChange,
  className
}) => {
  return (
    <div className={cn("flex gap-1", className)}>
      {effortOptions.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-col items-center p-1 h-auto min-w-[40px] transition-all text-white border-0",
            value === option.value && "ring-2 ring-primary ring-offset-1",
            option.color
          )}
          title={`${option.label}: ${option.description}`}
        >
          <span className="text-sm font-bold">{option.symbol}</span>
          <span className="text-xs">{option.label.split(' ')[0]}</span>
        </Button>
      ))}
    </div>
  );
};

export default EffortChips;