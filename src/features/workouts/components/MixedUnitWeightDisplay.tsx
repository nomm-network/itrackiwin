// Step 7.3: UI behavior - Workout screens with converted hints
import { Badge } from '@/components/ui/badge';
import { formatWeightWithConversion, WeightUnit } from '@/lib/equipment/mixedUnits';

interface MixedUnitWeightDisplayProps {
  weight: number;
  nativeUnit: WeightUnit;
  displayUnit: WeightUnit;
  showConversionHint?: boolean;
  className?: string;
}

export function MixedUnitWeightDisplay({ 
  weight, 
  nativeUnit, 
  displayUnit, 
  showConversionHint = true,
  className = ""
}: MixedUnitWeightDisplayProps) {
  const formattedWeight = formatWeightWithConversion(
    weight, 
    nativeUnit, 
    displayUnit, 
    showConversionHint
  );

  const hasConversion = nativeUnit !== displayUnit;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-mono text-lg">
        {weight} {displayUnit}
      </span>
      
      {hasConversion && showConversionHint && (
        <Badge variant="outline" className="text-xs">
          ≈ {(displayUnit === 'kg' ? weight * 2.2046 : weight * 0.4536).toFixed(1)} {displayUnit === 'kg' ? 'lb' : 'kg'}
        </Badge>
      )}
    </div>
  );
}

// Compact version for tight spaces
export function CompactMixedUnitDisplay({ 
  weight, 
  nativeUnit, 
  displayUnit 
}: Pick<MixedUnitWeightDisplayProps, 'weight' | 'nativeUnit' | 'displayUnit'>) {
  if (nativeUnit === displayUnit) {
    return <span className="font-mono">{weight} {displayUnit}</span>;
  }

  const converted = displayUnit === 'kg' ? weight * 2.2046 : weight * 0.4536;
  
  return (
    <span className="font-mono text-sm">
      {weight} {displayUnit}
      <span className="text-muted-foreground ml-1">
        (≈{converted.toFixed(1)} {displayUnit === 'kg' ? 'lb' : 'kg'})
      </span>
    </span>
  );
}