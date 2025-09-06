import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UnilateralSetData } from '../types/warmup-unified';

interface UnilateralSetCardProps {
  setIndex: number;
  data?: UnilateralSetData;
  isUnilateral: boolean;
  onUpdate: (data: UnilateralSetData) => void;
  onComplete: () => void;
  isCompleted?: boolean;
}

export function UnilateralSetCard({
  setIndex,
  data,
  isUnilateral,
  onUpdate,
  onComplete,
  isCompleted = false
}: UnilateralSetCardProps) {
  const [localData, setLocalData] = useState<UnilateralSetData>(
    data || { side: 'both', weight: 0, reps: 0 }
  );

  const handleSideChange = (side: 'left' | 'right' | 'both') => {
    const newData = { ...localData, side };
    setLocalData(newData);
    onUpdate(newData);
  };

  const handleWeightChange = (weight: number) => {
    const newData = { ...localData, weight };
    setLocalData(newData);
    onUpdate(newData);
  };

  const handleRepsChange = (reps: number) => {
    const newData = { ...localData, reps };
    setLocalData(newData);
    onUpdate(newData);
  };

  return (
    <Card className={`${isCompleted ? 'opacity-75 bg-muted/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">Set {setIndex}</span>
            {isUnilateral && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={localData.side === 'left' ? 'default' : 'outline'}
                  onClick={() => handleSideChange('left')}
                  className="px-2 py-1 text-xs"
                >
                  Left
                </Button>
                <Button
                  size="sm"
                  variant={localData.side === 'right' ? 'default' : 'outline'}
                  onClick={() => handleSideChange('right')}
                  className="px-2 py-1 text-xs"
                >
                  Right
                </Button>
                <Button
                  size="sm"
                  variant={localData.side === 'both' ? 'default' : 'outline'}
                  onClick={() => handleSideChange('both')}
                  className="px-2 py-1 text-xs"
                >
                  Both
                </Button>
              </div>
            )}
          </div>
          <Badge variant={localData.side === 'both' ? 'default' : 'secondary'}>
            {localData.side}
          </Badge>
        </div>

        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Weight (kg)</label>
            <Input
              type="number"
              step="0.25"
              value={localData.weight || ''}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
              disabled={isCompleted}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Reps</label>
            <Input
              type="number"
              value={localData.reps || ''}
              onChange={(e) => handleRepsChange(parseInt(e.target.value) || 0)}
              disabled={isCompleted}
            />
          </div>
        </div>

        {!isCompleted && (
          <Button
            onClick={onComplete}
            disabled={!localData.weight || !localData.reps}
            className="w-full"
          >
            Complete Set
          </Button>
        )}

        {isCompleted && (
          <div className="text-sm text-muted-foreground text-center">
            ✓ Completed: {localData.weight}kg × {localData.reps} reps ({localData.side})
          </div>
        )}
      </CardContent>
    </Card>
  );
}