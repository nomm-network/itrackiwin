import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Info } from 'lucide-react';
import { TargetProposal } from '@/lib/training/readinessTargeting';
import { WeightModel } from '@/lib/equipment/gymWeightModel';
import { formatWeight } from '@/lib/equipment/convert';

interface LoadMathDebugDrawerProps {
  proposal: TargetProposal | null;
  weightModel: WeightModel | null;
  enabled?: boolean;
  className?: string;
}

export const LoadMathDebugDrawer: React.FC<LoadMathDebugDrawerProps> = ({
  proposal,
  weightModel,
  enabled = false,
  className
}) => {
  if (!enabled) return null;
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={className}
        >
          <Calculator className="h-4 w-4 mr-2" />
          Load Math
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Load Calculation Debug
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Readiness Section */}
          {proposal && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Readiness Impact</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Score</div>
                  <Badge variant="outline">{proposal.readinessScore}/100</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Multiplier</div>
                  <Badge variant={proposal.readinessMultiplier > 1 ? 'default' : 'secondary'}>
                    {(proposal.readinessMultiplier * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          <Separator />
          
          {/* Weight Calculation */}
          {proposal && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Weight Calculation</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Baseline:</span>
                  <span className="text-sm font-mono">
                    {formatWeight(proposal.baselineKg, weightModel?.unit || 'kg')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Before Snap:</span>
                  <span className="text-sm font-mono">
                    {formatWeight(proposal.discreteSnap.beforeKg, weightModel?.unit || 'kg')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Final:</span>
                  <span className="text-sm font-mono font-semibold">
                    {formatWeight(proposal.proposedKg, weightModel?.unit || 'kg')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Min Step Size:</div>
                <Badge variant="outline">
                  {formatWeight(proposal.minStepKg, weightModel?.unit || 'kg')}
                </Badge>
              </div>
              
              {!proposal.discreteSnap.achievable && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-orange-600" />
                    <span className="text-xs text-orange-700">
                      Limited by available plates
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <Separator />
          
          {/* Equipment Model */}
          {weightModel && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Equipment Model</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Unit:</span>
                  <Badge variant="outline">{weightModel.unit}</Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Available Plates (per side):</div>
                  <div className="flex flex-wrap gap-1">
                    {weightModel.platesKgPerSide.map((plate, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {formatWeight(plate, weightModel.unit)}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Bar Weights:</div>
                  <div className="space-y-1">
                    {Object.entries(weightModel.barTypes).map(([type, config]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-xs capitalize">{type}:</span>
                        <span className="text-xs font-mono">
                          {formatWeight(config.barKg, weightModel.unit)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <Separator />
          
          {/* Rationale */}
          {proposal?.rationale && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Calculation Rationale</h3>
              <div className="space-y-2">
                {proposal.rationale.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};