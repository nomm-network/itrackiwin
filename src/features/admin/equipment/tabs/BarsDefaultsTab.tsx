import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const BarsDefaultsTab = () => {
  const [kgBars, setKgBars] = useState({
    straight: { min: 10, max: 50, step: 5 },
    ez: { min: 7.5, max: 30, step: 2.5 }
  });
  
  const [lbBars, setLbBars] = useState({
    straight: { min: 20, max: 110, step: 10 },
    ez: { min: 15, max: 65, step: 5 }
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateBarList = (min: number, max: number, step: number) => {
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
        description: 'Bar defaults saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save bar defaults',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kg Bars */}
        <Card>
          <CardHeader>
            <CardTitle>Kilogram Fixed Bars</CardTitle>
            <CardDescription>Define ranges for pre-weighted kg bars</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Straight Bars */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Straight Bars</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Min"
                  value={kgBars.straight.min}
                  onChange={(e) => setKgBars(prev => ({
                    ...prev,
                    straight: { ...prev.straight, min: parseFloat(e.target.value) || 0 }
                  }))}
                />
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Max"
                  value={kgBars.straight.max}
                  onChange={(e) => setKgBars(prev => ({
                    ...prev,
                    straight: { ...prev.straight, max: parseFloat(e.target.value) || 0 }
                  }))}
                />
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Step"
                  value={kgBars.straight.step}
                  onChange={(e) => setKgBars(prev => ({
                    ...prev,
                    straight: { ...prev.straight, step: parseFloat(e.target.value) || 0.5 }
                  }))}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {generateBarList(kgBars.straight.min, kgBars.straight.max, kgBars.straight.step)
                  .slice(0, 5)
                  .map(w => `${w}kg`)
                  .join(', ')}...
              </div>
            </div>

            {/* EZ Bars */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">EZ Curl Bars</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Min"
                  value={kgBars.ez.min}
                  onChange={(e) => setKgBars(prev => ({
                    ...prev,
                    ez: { ...prev.ez, min: parseFloat(e.target.value) || 0 }
                  }))}
                />
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Max"
                  value={kgBars.ez.max}
                  onChange={(e) => setKgBars(prev => ({
                    ...prev,
                    ez: { ...prev.ez, max: parseFloat(e.target.value) || 0 }
                  }))}
                />
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Step"
                  value={kgBars.ez.step}
                  onChange={(e) => setKgBars(prev => ({
                    ...prev,
                    ez: { ...prev.ez, step: parseFloat(e.target.value) || 0.5 }
                  }))}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {generateBarList(kgBars.ez.min, kgBars.ez.max, kgBars.ez.step)
                  .slice(0, 5)
                  .map(w => `${w}kg`)
                  .join(', ')}...
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lb Bars */}
        <Card>
          <CardHeader>
            <CardTitle>Pound Fixed Bars</CardTitle>
            <CardDescription>Define ranges for pre-weighted lb bars</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Straight Bars */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Straight Bars</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  step="1"
                  placeholder="Min"
                  value={lbBars.straight.min}
                  onChange={(e) => setLbBars(prev => ({
                    ...prev,
                    straight: { ...prev.straight, min: parseFloat(e.target.value) || 0 }
                  }))}
                />
                <Input
                  type="number"
                  step="1"
                  placeholder="Max"
                  value={lbBars.straight.max}
                  onChange={(e) => setLbBars(prev => ({
                    ...prev,
                    straight: { ...prev.straight, max: parseFloat(e.target.value) || 0 }
                  }))}
                />
                <Input
                  type="number"
                  step="1"
                  placeholder="Step"
                  value={lbBars.straight.step}
                  onChange={(e) => setLbBars(prev => ({
                    ...prev,
                    straight: { ...prev.straight, step: parseFloat(e.target.value) || 1 }
                  }))}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {generateBarList(lbBars.straight.min, lbBars.straight.max, lbBars.straight.step)
                  .slice(0, 5)
                  .map(w => `${w}lb`)
                  .join(', ')}...
              </div>
            </div>

            {/* EZ Bars */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">EZ Curl Bars</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  step="1"
                  placeholder="Min"
                  value={lbBars.ez.min}
                  onChange={(e) => setLbBars(prev => ({
                    ...prev,
                    ez: { ...prev.ez, min: parseFloat(e.target.value) || 0 }
                  }))}
                />
                <Input
                  type="number"
                  step="1"
                  placeholder="Max"
                  value={lbBars.ez.max}
                  onChange={(e) => setLbBars(prev => ({
                    ...prev,
                    ez: { ...prev.ez, max: parseFloat(e.target.value) || 0 }
                  }))}
                />
                <Input
                  type="number"
                  step="1"
                  placeholder="Step"
                  value={lbBars.ez.step}
                  onChange={(e) => setLbBars(prev => ({
                    ...prev,
                    ez: { ...prev.ez, step: parseFloat(e.target.value) || 1 }
                  }))}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {generateBarList(lbBars.ez.min, lbBars.ez.max, lbBars.ez.step)
                  .slice(0, 5)
                  .map(w => `${w}lb`)
                  .join(', ')}...
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