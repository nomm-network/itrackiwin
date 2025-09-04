import React, { useState } from 'react';
import { useUnilateralMode } from '@/hooks/useUnilateralMode';
import UnilateralSetInput from './UnilateralSetInput';
import BilateralSetInput from './BilateralSetInput';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Scale } from 'lucide-react';
import { UnilateralCapability, UnilateralMode } from '@/types/unilateral';

interface AdaptiveSetInputProps {
  exerciseCapability?: UnilateralCapability;
  modeOverride?: UnilateralMode;
  onDataChange: (data: {
    bilateral?: { weight: number; reps: number };
    unilateral?: {
      left_weight?: number;
      left_reps?: number;
      right_weight?: number;
      right_reps?: number;
      is_alternating?: boolean;
    };
  }) => void;
  unit?: string;
  className?: string;
}

const AdaptiveSetInput: React.FC<AdaptiveSetInputProps> = ({
  exerciseCapability = 'bilateral_only',
  modeOverride = 'auto',
  onDataChange,
  unit = 'kg',
  className
}) => {
  const { isUnilateral, mode, canAlternate } = useUnilateralMode({
    exerciseCapability,
    workoutExerciseModeOverride: modeOverride
  });

  // Bilateral state
  const [bilateralWeight, setBilateralWeight] = useState<number | ''>('');
  const [bilateralReps, setBilateralReps] = useState<number | ''>('');

  // Unilateral state
  const [leftWeight, setLeftWeight] = useState<number | ''>('');
  const [leftReps, setLeftReps] = useState<number | ''>('');
  const [rightWeight, setRightWeight] = useState<number | ''>('');
  const [rightReps, setRightReps] = useState<number | ''>('');
  const [isAlternating, setIsAlternating] = useState(mode === 'unilateral_alternating');

  // Update parent when bilateral data changes
  React.useEffect(() => {
    if (!isUnilateral && bilateralWeight && bilateralReps) {
      onDataChange({
        bilateral: {
          weight: bilateralWeight as number,
          reps: bilateralReps as number
        }
      });
    }
  }, [bilateralWeight, bilateralReps, isUnilateral, onDataChange]);

  // Update parent when unilateral data changes
  React.useEffect(() => {
    if (isUnilateral) {
      onDataChange({
        unilateral: {
          left_weight: leftWeight as number || undefined,
          left_reps: leftReps as number || undefined,
          right_weight: rightWeight as number || undefined,
          right_reps: rightReps as number || undefined,
          is_alternating: isAlternating
        }
      });
    }
  }, [leftWeight, leftReps, rightWeight, rightReps, isAlternating, isUnilateral, onDataChange]);

  if (isUnilateral) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Unilateral Exercise</span>
          </div>
          {canAlternate && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAlternating(!isAlternating)}
              className="text-xs"
            >
              {isAlternating ? 'Alternating' : 'Same Side'}
            </Button>
          )}
        </div>
        
        <UnilateralSetInput
          leftWeight={leftWeight}
          leftReps={leftReps}
          rightWeight={rightWeight}
          rightReps={rightReps}
          onLeftWeightChange={setLeftWeight}
          onLeftRepsChange={setLeftReps}
          onRightWeightChange={setRightWeight}
          onRightRepsChange={setRightReps}
          isAlternating={isAlternating}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Scale className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Bilateral Exercise</span>
      </div>
      
      <BilateralSetInput
        weight={bilateralWeight}
        reps={bilateralReps}
        onWeightChange={setBilateralWeight}
        onRepsChange={setBilateralReps}
        unit={unit}
      />
    </div>
  );
};

export default AdaptiveSetInput;