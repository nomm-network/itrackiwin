import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const StacksDefaultsTab = () => {
  const [kgStacks, setKgStacks] = useState({
    steps: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    aux: [1.25, 2.5]
  });
  
  const [lbStacks, setLbStacks] = useState({
    steps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    aux: [2.5, 5]
  });
  
  const [newKgStep, setNewKgStep] = useState('');
  const [newKgAux, setNewKgAux] = useState('');
  const [newLbStep, setNewLbStep] = useState('');
  const [newLbAux, setNewLbAux] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addWeight = (unit: 'kg' | 'lb', type: 'steps' | 'aux') => {
    const newWeight = parseFloat(
      unit === 'kg' ? (type === 'steps' ? newKgStep : newKgAux) : (type === 'steps' ? newLbStep : newLbAux)
    );
    
    if (isNaN(newWeight) || newWeight <= 0) {
      toast({
        title: 'Invalid weight',
        description: 'Please enter a valid positive number',
        variant: 'destructive'
      });
      return;
    }

    if (unit === 'kg') {
      if (type === 'steps') {
        setKgStacks(prev => ({
          ...prev,
          steps: [...new Set([...prev.steps, newWeight])].sort((a, b) => a - b)
        }));
        setNewKgStep('');
      } else {
        setKgStacks(prev => ({
          ...prev,
          aux: [...new Set([...prev.aux, newWeight])].sort((a, b) => a - b)
        }));
        setNewKgAux('');
      }
    } else {
      if (type === 'steps') {
        setLbStacks(prev => ({
          ...prev,
          steps: [...new Set([...prev.steps, newWeight])].sort((a, b) => a - b)
        }));
        setNewLbStep('');
      } else {
        setLbStacks(prev => ({
          ...prev,
          aux: [...new Set([...prev.aux, newWeight])].sort((a, b) => a - b)
        }));
        setNewLbAux('');
      }
    }
  };

  const removeWeight = (unit: 'kg' | 'lb', type: 'steps' | 'aux', index: number) => {
    if (unit === 'kg') {
      if (type === 'steps') {
        setKgStacks(prev => ({
          ...prev,
          steps: prev.steps.filter((_, i) => i !== index)
        }));
      } else {
        setKgStacks(prev => ({
          ...prev,
          aux: prev.aux.filter((_, i) => i !== index)
        }));
      }
    } else {
      if (type === 'steps') {
        setLbStacks(prev => ({
          ...prev,
          steps: prev.steps.filter((_, i) => i !== index)
        }));
      } else {
        setLbStacks(prev => ({
          ...prev,
          aux: prev.aux.filter((_, i) => i !== index)
        }));
      }
    }
  };

  const saveDefaults = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would save to the database
      toast({
        title: 'Success',
        description: 'Stack defaults saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save stack defaults',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kg Stacks */}
        <Card>
          <CardHeader>
            <CardTitle>Kilogram Machine Stacks</CardTitle>
            <CardDescription>Define main stack steps and auxiliary micro weights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Stack Steps */}
            <div className="space-y-3">
              <Label>Main Stack Steps</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Add stack step"
                  value={newKgStep}
                  onChange={(e) => setNewKgStep(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWeight('kg', 'steps')}
                />
                <Button onClick={() => addWeight('kg', 'steps')} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {kgStacks.steps.map((weight, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {weight} kg
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeWeight('kg', 'steps', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Auxiliary Weights */}
            <div className="space-y-3">
              <Label>Auxiliary Micro Weights</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.25"
                  placeholder="Add micro weight"
                  value={newKgAux}
                  onChange={(e) => setNewKgAux(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWeight('kg', 'aux')}
                />
                <Button onClick={() => addWeight('kg', 'aux')} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {kgStacks.aux.map((weight, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    +{weight} kg
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeWeight('kg', 'aux', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lb Stacks */}
        <Card>
          <CardHeader>
            <CardTitle>Pound Machine Stacks</CardTitle>
            <CardDescription>Define main stack steps and auxiliary micro weights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Stack Steps */}
            <div className="space-y-3">
              <Label>Main Stack Steps</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="1"
                  placeholder="Add stack step"
                  value={newLbStep}
                  onChange={(e) => setNewLbStep(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWeight('lb', 'steps')}
                />
                <Button onClick={() => addWeight('lb', 'steps')} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {lbStacks.steps.map((weight, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {weight} lb
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeWeight('lb', 'steps', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Auxiliary Weights */}
            <div className="space-y-3">
              <Label>Auxiliary Micro Weights</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Add micro weight"
                  value={newLbAux}
                  onChange={(e) => setNewLbAux(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWeight('lb', 'aux')}
                />
                <Button onClick={() => addWeight('lb', 'aux')} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {lbStacks.aux.map((weight, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    +{weight} lb
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeWeight('lb', 'aux', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
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