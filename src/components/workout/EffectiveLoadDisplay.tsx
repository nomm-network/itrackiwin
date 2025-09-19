import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EffectiveLoadDisplayProps {
  totalWeight?: number | null;
  weight?: number | null;
  loadMode?: string;
  bodyweightPct?: number;
  loggedBodyweight?: number;
  className?: string;
}

/**
 * Displays the effective load for a set, showing total calculated weight
 * for bodyweight exercises or regular weight for traditional exercises
 */
export const EffectiveLoadDisplay: React.FC<EffectiveLoadDisplayProps> = ({
  totalWeight,
  weight,
  loadMode,
  bodyweightPct,
  loggedBodyweight,
  className
}) => {
  // Show effective load for bodyweight exercises with total weight calculation
  if (loadMode === 'bodyweight_plus_optional' && totalWeight !== null && totalWeight !== undefined) {
    const baseWeight = loggedBodyweight && bodyweightPct ? loggedBodyweight * bodyweightPct : 0;
    const externalWeight = weight || 0;
    
    return (
      <div className={`text-sm ${className}`}>
        <div className="font-medium">
          Effective: {totalWeight.toFixed(1)}kg
        </div>
        <div className="text-xs text-muted-foreground">
          {baseWeight > 0 && (
            <>BW {loggedBodyweight?.toFixed(0)}kg × {(bodyweightPct || 0) * 100}%</>
          )}
          {externalWeight !== 0 && (
            <> {externalWeight > 0 ? '+' : ''}{externalWeight}kg</>
          )}
        </div>
      </div>
    );
  }

  // Show regular weight for traditional exercises
  if (weight && loadMode === 'external_added') {
    return (
      <div className={`text-sm font-medium ${className}`}>
        {weight}kg
      </div>
    );
  }

  // No weight to display
  return null;
};