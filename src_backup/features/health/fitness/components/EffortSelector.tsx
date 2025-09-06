import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

type EffortLevel = 'very_easy' | 'easy' | 'moderate' | 'hard' | 'very_hard';

interface EffortSelectorProps {
  onEffortSelect: (effort: EffortLevel) => void;
  onPainReport: () => void;
  selectedEffort?: EffortLevel;
  className?: string;
}

const effortOptions = [
  {
    value: 'very_easy' as const,
    label: 'Very Easy',
    symbol: '😌',
    description: 'Could do this all day',
    colorClass: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
  },
  {
    value: 'easy' as const,
    label: 'Easy',
    symbol: '🙂',
    description: 'Light effort, breathing normal',
    colorClass: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
  },
  {
    value: 'moderate' as const,
    label: 'Moderate',
    symbol: '😐',
    description: 'Noticeable effort, slightly out of breath',
    colorClass: 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200'
  },
  {
    value: 'hard' as const,
    label: 'Hard',
    symbol: '😤',
    description: 'Difficult, breathing heavy',
    colorClass: 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200'
  },
  {
    value: 'very_hard' as const,
    label: 'Very Hard',
    symbol: '😮‍💨',
    description: 'Maximum effort, very difficult',
    colorClass: 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
  }
];

const EffortSelector: React.FC<EffortSelectorProps> = ({
  onEffortSelect,
  onPainReport,
  selectedEffort,
  className = ''
}) => {
  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">How did that feel?</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {effortOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedEffort === option.value ? "default" : "outline"}
            className={`h-auto p-3 flex flex-col items-center text-center ${
              selectedEffort === option.value ? '' : option.colorClass
            }`}
            onClick={() => onEffortSelect(option.value)}
          >
            <span className="text-2xl mb-1">{option.symbol}</span>
            <span className="text-sm font-medium">{option.label}</span>
          </Button>
        ))}
      </div>
      
      <Button
        variant="destructive"
        className="w-full mb-4"
        onClick={onPainReport}
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        Pain
      </Button>
      
      {selectedEffort && (
        <div className="text-sm text-muted-foreground text-center">
          {effortOptions.find(option => option.value === selectedEffort)?.description}
        </div>
      )}
    </Card>
  );
};

export default EffortSelector;