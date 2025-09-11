import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const DumbbellsDefaultsTab = () => {
  const [kgRange, setKgRange] = useState({ min: 2.5, max: 50, step: 2.5 });
  const [lbRange, setLbRange] = useState({ min: 5, max: 120, step: 5 });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateDumbbellList = (min: number, max: number, step: number) => {
    const list = [];
    for (let weight = min; weight <= max; weight += step) {
      list.push(weight);
    }
    return list;
  };

  const saveDefaults = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would save to the database
      toast({
        title: 'Success',
        description: 'Dumbbell defaults saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save dumbbell defaults',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kg Dumbbells */}
        <Card>
          <CardHeader>
            <CardTitle>Kilogram Dumbbells</CardTitle>
            <CardDescription>Define the range and increment for kg dumbbells</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="kg-min">Min (kg)</Label>
                <Input
                  id="kg-min"
                  type="number"
                  step="0.5"
                  value={kgRange.min}
                  onChange={(e) => setKgRange(prev => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="kg-max">Max (kg)</Label>
                <Input
                  id="kg-max"
                  type="number"
                  step="0.5"
                  value={kgRange.max}
                  onChange={(e) => setKgRange(prev => ({ ...prev, max: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="kg-step">Step (kg)</Label>
                <Input
                  id="kg-step"
                  type="number"
                  step="0.5"
                  value={kgRange.step}
                  onChange={(e) => setKgRange(prev => ({ ...prev, step: parseFloat(e.target.value) || 0.5 }))}
                />
              </div>
            </div>
            
            <div>
              <Label>Preview (first 10)</Label>
              <div className="text-sm text-muted-foreground mt-1">
                {generateDumbbellList(kgRange.min, kgRange.max, kgRange.step)
                  .slice(0, 10)
                  .map(w => `${w}kg`)
                  .join(', ')}
                {generateDumbbellList(kgRange.min, kgRange.max, kgRange.step).length > 10 && '...'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lb Dumbbells */}
        <Card>
          <CardHeader>
            <CardTitle>Pound Dumbbells</CardTitle>
            <CardDescription>Define the range and increment for lb dumbbells</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="lb-min">Min (lb)</Label>
                <Input
                  id="lb-min"
                  type="number"
                  step="1"
                  value={lbRange.min}
                  onChange={(e) => setLbRange(prev => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="lb-max">Max (lb)</Label>
                <Input
                  id="lb-max"
                  type="number"
                  step="1"
                  value={lbRange.max}
                  onChange={(e) => setLbRange(prev => ({ ...prev, max: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="lb-step">Step (lb)</Label>
                <Input
                  id="lb-step"
                  type="number"
                  step="1"
                  value={lbRange.step}
                  onChange={(e) => setLbRange(prev => ({ ...prev, step: parseFloat(e.target.value) || 1 }))}
                />
              </div>
            </div>
            
            <div>
              <Label>Preview (first 10)</Label>
              <div className="text-sm text-muted-foreground mt-1">
                {generateDumbbellList(lbRange.min, lbRange.max, lbRange.step)
                  .slice(0, 10)
                  .map(w => `${w}lb`)
                  .join(', ')}
                {generateDumbbellList(lbRange.min, lbRange.max, lbRange.step).length > 10 && '...'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveDefaults} disabled={loading}>
          {loading ? 'Saving...' : 'Save Global Defaults'}
        </Button>
      </div>
    </div>
  );
};