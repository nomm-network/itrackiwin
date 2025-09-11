import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { fetchGlobalDefaults, saveGlobalPlateProfile } from '@/lib/equipment/api';
import { normalizeSteps } from '@/lib/equipment/convert';
import { useToast } from '@/hooks/use-toast';

export const PlatesDefaultsTab = () => {
  const [kgPlates, setKgPlates] = useState<number[]>([25, 20, 15, 10, 5, 2.5, 1.25, 0.5]);
  const [lbPlates, setLbPlates] = useState<number[]>([45, 35, 25, 10, 5, 2.5]);
  const [newKgPlate, setNewKgPlate] = useState('');
  const [newLbPlate, setNewLbPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDefaults();
  }, []);

  const loadDefaults = async () => {
    try {
      const defaults = await fetchGlobalDefaults();
      
      // Extract kg plates
      const kgProfile = defaults.plates.find(p => p.default_unit === 'kg');
      if (kgProfile) {
        // We'd need to fetch the actual plates - simplified for now
      }
      
      // Extract lb plates
      const lbProfile = defaults.plates.find(p => p.default_unit === 'lb');
      if (lbProfile) {
        // We'd need to fetch the actual plates - simplified for now
      }
    } catch (error) {
      console.error('Error loading defaults:', error);
    }
  };

  const addPlate = (unit: 'kg' | 'lb') => {
    const newPlate = unit === 'kg' ? parseFloat(newKgPlate) : parseFloat(newLbPlate);
    
    if (isNaN(newPlate) || newPlate <= 0) {
      toast({
        title: 'Invalid weight',
        description: 'Please enter a valid positive number',
        variant: 'destructive'
      });
      return;
    }

    if (unit === 'kg') {
      setKgPlates(normalizeSteps('kg', [...kgPlates, newPlate]));
      setNewKgPlate('');
    } else {
      setLbPlates(normalizeSteps('lb', [...lbPlates, newPlate]));
      setNewLbPlate('');
    }
  };

  const removePlate = (unit: 'kg' | 'lb', index: number) => {
    if (unit === 'kg') {
      setKgPlates(kgPlates.filter((_, i) => i !== index));
    } else {
      setLbPlates(lbPlates.filter((_, i) => i !== index));
    }
  };

  const saveDefaults = async () => {
    setLoading(true);
    try {
      // Save kg profile
      await saveGlobalPlateProfile({
        name: 'EU Standard KG Updated',
        default_unit: 'kg',
        plates: kgPlates.map((weight, index) => ({
          weight_kg: weight,
          display_order: (index + 1) * 10
        }))
      });

      // Save lb profile (convert to kg for storage)
      await saveGlobalPlateProfile({
        name: 'US Standard LB Updated',
        default_unit: 'lb',
        plates: lbPlates.map((weight, index) => ({
          weight_kg: weight * 0.45359237, // Convert to kg
          display_order: (index + 1) * 10
        }))
      });

      toast({
        title: 'Success',
        description: 'Global plate defaults saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save plate defaults',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kg Plates */}
        <Card>
          <CardHeader>
            <CardTitle>Kilogram Plates</CardTitle>
            <CardDescription>Default plate weights for metric gyms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.5"
                placeholder="Add kg plate"
                value={newKgPlate}
                onChange={(e) => setNewKgPlate(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlate('kg')}
              />
              <Button onClick={() => addPlate('kg')} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {kgPlates.map((weight, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {weight} kg
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removePlate('kg', index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lb Plates */}
        <Card>
          <CardHeader>
            <CardTitle>Pound Plates</CardTitle>
            <CardDescription>Default plate weights for imperial gyms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                step="1"
                placeholder="Add lb plate"
                value={newLbPlate}
                onChange={(e) => setNewLbPlate(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlate('lb')}
              />
              <Button onClick={() => addPlate('lb')} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {lbPlates.map((weight, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {weight} lb
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removePlate('lb', index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
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