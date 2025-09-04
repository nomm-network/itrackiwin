import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUnilateralMode } from '@/hooks/useUnilateralMode';
import UnilateralSetInput from './UnilateralSetInput';
import BilateralSetInput from './BilateralSetInput';
import { UnilateralCapability, UnilateralMode } from '@/types/unilateral';
import { ArrowLeftRight, Scale } from 'lucide-react';
// Simple UUID generator for browser
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface SetData {
  // Bilateral
  weight?: number;
  reps?: number;
  
  // Unilateral
  left_weight?: number;
  left_reps?: number;
  right_weight?: number;
  right_reps?: number;
  is_alternating?: boolean;
  side?: string;
  side_pair_key?: string;
  side_order?: number;
}

interface AdaptiveSetFormProps {
  exerciseId: string;
  exerciseCapability?: UnilateralCapability;
  modeOverride?: UnilateralMode;
  onSubmit: (data: SetData) => void;
  isLoading?: boolean;
  unit?: string;
  className?: string;
}

const AdaptiveSetForm: React.FC<AdaptiveSetFormProps> = ({
  exerciseId,
  exerciseCapability = 'bilateral_only', // Default for now
  modeOverride = 'auto',
  onSubmit,
  isLoading = false,
  unit = 'kg',
  className
}) => {
  const { isUnilateral, mode } = useUnilateralMode({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isUnilateral) {
      // Validate that at least one side has data
      const hasLeftData = leftWeight && leftReps;
      const hasRightData = rightWeight && rightReps;
      
      if (!hasLeftData && !hasRightData) {
        return; // Don't submit if no data
      }

      const pairKey = generateUUID();
      
      onSubmit({
        left_weight: leftWeight as number || undefined,
        left_reps: leftReps as number || undefined,
        right_weight: rightWeight as number || undefined,
        right_reps: rightReps as number || undefined,
        is_alternating: isAlternating,
        side: 'both', // Since we're tracking both sides in one set
        side_pair_key: pairKey,
      });
    } else {
      // Bilateral mode
      if (!bilateralWeight || !bilateralReps) {
        return; // Don't submit if incomplete
      }

      onSubmit({
        weight: bilateralWeight as number,
        reps: bilateralReps as number,
        side: 'both'
      });
    }

    // Reset form
    setBilateralWeight('');
    setBilateralReps('');
    setLeftWeight('');
    setLeftReps('');
    setRightWeight('');
    setRightReps('');
  };

  const canSubmit = isUnilateral 
    ? (leftWeight && leftReps) || (rightWeight && rightReps)
    : bilateralWeight && bilateralReps;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {isUnilateral ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Unilateral Exercise</span>
              </div>
              {exerciseCapability === 'either' && (
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
        ) : (
          <div>
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
        )}

        <Button 
          type="submit" 
          size="sm" 
          disabled={isLoading || !canSubmit} 
          className="w-full"
        >
          {isLoading ? 'Adding Set...' : 'Add Set'}
        </Button>
      </div>
    </form>
  );
};

export default AdaptiveSetForm;