import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, X } from 'lucide-react';
import { convertWeight } from '@/lib/equipment/convert';

interface StackIncrementsTableProps {
  stackSteps: number[];
  auxIncrements: number[];
  unit: 'kg' | 'lb';
  editable?: boolean;
  source?: 'global' | 'gym';
  onStackChange?: (stackSteps: number[], auxIncrements: number[]) => void;
}

export const StackIncrementsTable: React.FC<StackIncrementsTableProps> = ({
  stackSteps,
  auxIncrements,
  unit,
  editable = false,
  source = 'global',
  onStackChange
}) => {
  const [newStep, setNewStep] = useState('');
  const [newAux, setNewAux] = useState('');

  // Convert weights for display
  const convertedSteps = stackSteps.map(step => 
    unit === 'kg' ? step : convertWeight(step, 'kg', 'lb')
  );
  const convertedAux = auxIncrements.map(aux => 
    unit === 'kg' ? aux : convertWeight(aux, 'kg', 'lb')
  );

  // Generate preview of achievable weights
  const previewWeights = (() => {
    const weights = new Set<number>();
    
    // Add base stack steps
    convertedSteps.forEach(step => weights.add(step));
    
    // Add stack steps + aux increments
    convertedSteps.forEach(step => {
      convertedAux.forEach(aux => {
        weights.add(step + aux);
      });
    });
    
    return Array.from(weights).sort((a, b) => a - b).slice(0, 20); // Show first 20
  })();

  const handleAddStep = () => {
    const step = parseFloat(newStep);
    if (isNaN(step) || step <= 0) return;

    const stepKg = unit === 'kg' ? step : convertWeight(step, 'lb', 'kg');
    const newSteps = [...stackSteps, stepKg].sort((a, b) => a - b);
    onStackChange?.(newSteps, auxIncrements);
    setNewStep('');
  };

  const handleAddAux = () => {
    const aux = parseFloat(newAux);
    if (isNaN(aux) || aux <= 0) return;

    const auxKg = unit === 'kg' ? aux : convertWeight(aux, 'lb', 'kg');
    const newAuxArray = [...auxIncrements, auxKg].sort((a, b) => a - b);
    onStackChange?.(stackSteps, newAuxArray);
    setNewAux('');
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = stackSteps.filter((_, i) => i !== index);
    onStackChange?.(newSteps, auxIncrements);
  };

  const handleRemoveAux = (index: number) => {
    const newAux = auxIncrements.filter((_, i) => i !== index);
    onStackChange?.(stackSteps, newAux);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">Machine Stack Increments</h3>
        <Badge variant={unit === 'kg' ? 'default' : 'secondary'}>
          {unit.toUpperCase()}
        </Badge>
        {source === 'gym' && (
          <Badge variant="outline">Gym Override</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Stack Steps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Main Stack Steps</CardTitle>
            <CardDescription>Primary weight increments on the stack</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editable && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={`Add step (${unit})`}
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                  step={unit === 'kg' ? '0.5' : '1'}
                />
                <Button size="sm" onClick={handleAddStep}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-1">
              {convertedSteps.map((step, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {step} {unit}
                  {editable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleRemoveStep(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              ))}
              {convertedSteps.length === 0 && (
                <span className="text-sm text-muted-foreground">No stack steps configured</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Auxiliary Increments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Auxiliary Increments</CardTitle>
            <CardDescription>Micro weights, magnets, or add-on plates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editable && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={`Add aux (${unit})`}
                  value={newAux}
                  onChange={(e) => setNewAux(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAux()}
                  step={unit === 'kg' ? '0.25' : '0.5'}
                />
                <Button size="sm" onClick={handleAddAux}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-1">
              {convertedAux.map((aux, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  +{aux} {unit}
                  {editable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleRemoveAux(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              ))}
              {convertedAux.length === 0 && (
                <span className="text-sm text-muted-foreground">No auxiliary increments configured</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Table */}
      {previewWeights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Achievable Weights Preview</CardTitle>
            <CardDescription>
              First 20 possible combinations (stack steps + aux increments)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {previewWeights.map((weight, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {weight} {unit}
                </Badge>
              ))}
              {stackSteps.length + auxIncrements.length > 20 && (
                <Badge variant="outline" className="text-xs">...</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};