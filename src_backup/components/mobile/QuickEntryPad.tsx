import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Check, Plus, Minus } from 'lucide-react';

interface QuickEntryPadProps {
  onSubmit: (weight: number, reps: number) => void;
  className?: string;
  lastWeight?: number;
  lastReps?: number;
}

const QuickEntryPad: React.FC<QuickEntryPadProps> = ({
  onSubmit,
  className,
  lastWeight = 0,
  lastReps = 0
}) => {
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [mode, setMode] = useState<'weight' | 'reps'>('weight');

  const numberButtons = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['.', 0, '⌫']
  ];

  const quickWeights = [10, 20, 30, 40, 50, 60, 70, 80];
  const quickReps = [5, 8, 10, 12, 15, 20];

  const handleNumberPress = (value: string | number) => {
    const currentValue = mode === 'weight' ? weight : reps;
    const setValue = mode === 'weight' ? setWeight : setReps;

    if (value === '⌫') {
      setValue(currentValue.slice(0, -1));
    } else if (value === '.' && !currentValue.includes('.')) {
      setValue(currentValue + '.');
    } else if (typeof value === 'number') {
      setValue(currentValue + value.toString());
    }
  };

  const handleQuickValue = (value: number) => {
    const setValue = mode === 'weight' ? setWeight : setReps;
    setValue(value.toString());
  };

  const handleIncrement = () => {
    const currentValue = mode === 'weight' ? weight : reps;
    const setValue = mode === 'weight' ? setWeight : setReps;
    const increment = mode === 'weight' ? 2.5 : 1;
    
    const newValue = (parseFloat(currentValue) || 0) + increment;
    setValue(newValue.toString());
  };

  const handleDecrement = () => {
    const currentValue = mode === 'weight' ? weight : reps;
    const setValue = mode === 'weight' ? setWeight : setReps;
    const increment = mode === 'weight' ? 2.5 : 1;
    
    const newValue = Math.max(0, (parseFloat(currentValue) || 0) - increment);
    setValue(newValue.toString());
  };

  const handleSubmit = () => {
    const weightNum = parseFloat(weight) || 0;
    const repsNum = parseInt(reps) || 0;
    
    if (weightNum > 0 && repsNum > 0) {
      onSubmit(weightNum, repsNum);
      setWeight('');
      setReps('');
    }
  };

  const handleClear = () => {
    setWeight('');
    setReps('');
  };

  const isValid = parseFloat(weight) > 0 && parseInt(reps) > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'weight' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setMode('weight')}
          >
            Weight: {weight || '0'} kg
          </Button>
          <Button
            variant={mode === 'reps' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setMode('reps')}
          >
            Reps: {reps || '0'}
          </Button>
        </div>

        {/* Quick Values */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {mode === 'weight' ? 'Quick Weights (kg)' : 'Quick Reps'}
          </div>
          <div className="flex flex-wrap gap-2">
            {(mode === 'weight' ? quickWeights : quickReps).map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => handleQuickValue(value)}
                className="h-8 px-3"
              >
                {value}
              </Button>
            ))}
          </div>
        </div>

        {/* Last Values */}
        {(lastWeight > 0 || lastReps > 0) && (
          <div className="flex gap-2">
            {lastWeight > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWeight(lastWeight.toString())}
                className="text-xs"
              >
                Last: {lastWeight}kg
              </Button>
            )}
            {lastReps > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReps(lastReps.toString())}
                className="text-xs"
              >
                Last: {lastReps} reps
              </Button>
            )}
          </div>
        )}

        {/* Increment/Decrement */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            className="flex-1"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            className="flex-1"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-2">
          {numberButtons.flat().map((value, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-12 text-lg"
              onClick={() => handleNumberPress(value)}
            >
              {value}
            </Button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            Log Set
          </Button>
        </div>

        {/* Status */}
        {isValid && (
          <div className="text-center">
            <Badge variant="secondary">
              {weight}kg × {reps} reps ready to log
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickEntryPad;