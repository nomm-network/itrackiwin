import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlateTable } from '../components/PlateTable';
import { DumbbellTable } from '../components/DumbbellTable';
import { FixedBarsTable } from '../components/FixedBarsTable';
import { StackIncrementsTable } from '../components/StackIncrementsTable';
import { useGymEquipment, useGymEffectiveEquipment, useUpsertGymOverrides } from '../state/useEquipmentProfiles';
import { convertWeight } from '@/lib/equipment/convert';
import { useToast } from '@/hooks/use-toast';

interface GymEquipmentEditorProps {
  gymId: string;
  onSave: () => void;
  onCancel: () => void;
}

export const GymEquipmentEditor: React.FC<GymEquipmentEditorProps> = ({
  gymId,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const { data: gymEquipment } = useGymEquipment(gymId);
  const { data: kgProfile } = useGymEffectiveEquipment(gymId, 'kg');
  const { data: lbProfile } = useGymEffectiveEquipment(gymId, 'lb');
  const upsertOverrides = useUpsertGymOverrides();

  const [overrides, setOverrides] = useState({
    plates: false,
    dumbbells: false,
    bars: false,
    stacks: false
  });

  const [units, setUnits] = useState({
    plates: 'kg' as 'kg' | 'lb',
    dumbbells: 'kg' as 'kg' | 'lb',
    bars: 'kg' as 'kg' | 'lb',
    stacks: 'kg' as 'kg' | 'lb'
  });

  // Override data
  const [plates, setPlates] = useState<Array<{ weight_kg: number; display_order: number; count?: number }>>([]);
  const [dumbbells, setDumbbells] = useState<Array<{ weight_kg: number; pair_count?: number }>>([]);
  const [straightBars, setStraightBars] = useState<Array<{ weight_kg: number; count?: number }>>([]);
  const [ezBars, setEzBars] = useState<Array<{ weight_kg: number; count?: number }>>([]);
  const [stackSteps, setStackSteps] = useState<number[]>([]);
  const [auxIncrements, setAuxIncrements] = useState<number[]>([]);

  const [activeTab, setActiveTab] = useState('plates');

  useEffect(() => {
    // Initialize with current gym configuration
    if (gymEquipment) {
      setUnits({
        plates: gymEquipment.racks_display_unit || 'kg',
        dumbbells: gymEquipment.db_display_unit || 'kg',
        bars: gymEquipment.bars_display_unit || 'kg',
        stacks: gymEquipment.stack_display_unit || 'kg'
      });
    }
  }, [gymEquipment]);

  const toggleOverride = (section: keyof typeof overrides) => {
    setOverrides(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getCurrentProfile = (unit: 'kg' | 'lb') => {
    return unit === 'kg' ? kgProfile : lbProfile;
  };

  const getEffectiveEquipment = (section: 'plates' | 'dumbbells' | 'bars' | 'stacks') => {
    const unit = units[section];
    const profile = getCurrentProfile(unit);
    
    if (!profile) return null;

    switch (section) {
      case 'plates':
        const sides = (profile as any)?.sides;
        return sides?.map?.((weight: number, index: number) => ({
          weight_kg: unit === 'kg' ? weight : convertWeight(weight, 'lb', 'kg'),
          display_order: (index + 1) * 10,
          count: 2
        })) || [];
      default:
        return [];
    }
  };

  const handleSaveOverrides = async () => {
    try {
      const promises = [];

      if (overrides.plates) {
        promises.push(
          upsertOverrides.mutateAsync({
            gymId,
            overrideType: 'plates',
            data: {
              unit: units.plates,
              bar: 20, // Default barbell weight
              ez: 7.5, // Default EZ bar weight
              fixed: 20, // Default fixed bar weight
              sides: plates.map(p => p.weight_kg),
              micro: [0.5, 1.25] // Default micro plates
            }
          })
        );
      }

      if (overrides.dumbbells) {
        promises.push(
          upsertOverrides.mutateAsync({
            gymId,
            overrideType: 'dumbbells',
            data: {
              unit: units.dumbbells,
              pairs: dumbbells.map(d => d.weight_kg)
            }
          })
        );
      }

      if (overrides.stacks) {
        promises.push(
          upsertOverrides.mutateAsync({
            gymId,
            overrideType: 'stacks',
            data: {
              unit: units.stacks,
              steps: stackSteps,
              aux: auxIncrements
            }
          })
        );
      }

      await Promise.all(promises);

      toast({
        title: 'Success',
        description: 'Equipment overrides saved successfully'
      });
      onSave();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save equipment overrides',
        variant: 'destructive'
      });
    }
  };

  const handleBarsChange = (type: 'straight' | 'ez', bars: Array<{ weight_kg: number; count?: number }>) => {
    if (type === 'straight') {
      setStraightBars(bars);
    } else {
      setEzBars(bars);
    }
  };

  const handleStackChange = (steps: number[], aux: number[]) => {
    setStackSteps(steps);
    setAuxIncrements(aux);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Equipment overrides allow you to customize specific equipment for this gym 
        while keeping the global profile as the base configuration.
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plates">Plates</TabsTrigger>
          <TabsTrigger value="dumbbells">Dumbbells</TabsTrigger>
          <TabsTrigger value="bars">Fixed Bars</TabsTrigger>
          <TabsTrigger value="stacks">Stacks</TabsTrigger>
        </TabsList>

        <TabsContent value="plates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Plates Configuration</span>
                <div className="flex items-center gap-4">
                  <Select 
                    value={units.plates} 
                    onValueChange={(value: 'kg' | 'lb') => setUnits(prev => ({ ...prev, plates: value }))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">KG</SelectItem>
                      <SelectItem value="lb">LB</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label className="flex items-center gap-2">
                    <Switch 
                      checked={overrides.plates}
                      onCheckedChange={() => toggleOverride('plates')}
                    />
                    Override
                  </Label>
                </div>
              </CardTitle>
              <CardDescription>
                {overrides.plates ? 
                  'Custom plate configuration for this gym' : 
                  'Using global profile configuration'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overrides.plates ? (
                <PlateTable
                  plates={plates}
                  unit={units.plates}
                  editable={true}
                  source="gym"
                  onPlatesChange={setPlates}
                />
              ) : (
                <PlateTable
                  plates={getEffectiveEquipment('plates') || []}
                  unit={units.plates}
                  editable={false}
                  source="global"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dumbbells" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Dumbbells Configuration</span>
                <div className="flex items-center gap-4">
                  <Select 
                    value={units.dumbbells} 
                    onValueChange={(value: 'kg' | 'lb') => setUnits(prev => ({ ...prev, dumbbells: value }))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">KG</SelectItem>
                      <SelectItem value="lb">LB</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label className="flex items-center gap-2">
                    <Switch 
                      checked={overrides.dumbbells}
                      onCheckedChange={() => toggleOverride('dumbbells')}
                    />
                    Override
                  </Label>
                </div>
              </CardTitle>
              <CardDescription>
                {overrides.dumbbells ? 
                  'Custom dumbbell configuration for this gym' : 
                  'Using global profile configuration'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DumbbellTable
                dumbbells={dumbbells}
                unit={units.dumbbells}
                editable={overrides.dumbbells}
                source={overrides.dumbbells ? 'gym' : 'global'}
                onDumbbellsChange={setDumbbells}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bars" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Fixed Bars Configuration</span>
                <div className="flex items-center gap-4">
                  <Select 
                    value={units.bars} 
                    onValueChange={(value: 'kg' | 'lb') => setUnits(prev => ({ ...prev, bars: value }))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">KG</SelectItem>
                      <SelectItem value="lb">LB</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label className="flex items-center gap-2">
                    <Switch 
                      checked={overrides.bars}
                      onCheckedChange={() => toggleOverride('bars')}
                    />
                    Override
                  </Label>
                </div>
              </CardTitle>
              <CardDescription>
                {overrides.bars ? 
                  'Custom fixed bar configuration for this gym' : 
                  'Using global profile configuration'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FixedBarsTable
                straightBars={straightBars}
                ezBars={ezBars}
                unit={units.bars}
                editable={overrides.bars}
                source={overrides.bars ? 'gym' : 'global'}
                onBarsChange={handleBarsChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stacks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Machine Stacks Configuration</span>
                <div className="flex items-center gap-4">
                  <Select 
                    value={units.stacks} 
                    onValueChange={(value: 'kg' | 'lb') => setUnits(prev => ({ ...prev, stacks: value }))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">KG</SelectItem>
                      <SelectItem value="lb">LB</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label className="flex items-center gap-2">
                    <Switch 
                      checked={overrides.stacks}
                      onCheckedChange={() => toggleOverride('stacks')}
                    />
                    Override
                  </Label>
                </div>
              </CardTitle>
              <CardDescription>
                {overrides.stacks ? 
                  'Custom stack configuration for this gym' : 
                  'Using global profile configuration'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StackIncrementsTable
                stackSteps={stackSteps}
                auxIncrements={auxIncrements}
                unit={units.stacks}
                editable={overrides.stacks}
                source={overrides.stacks ? 'gym' : 'global'}
                onStackChange={handleStackChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSaveOverrides}
          disabled={upsertOverrides.isPending}
        >
          {upsertOverrides.isPending ? 'Saving...' : 'Save Overrides'}
        </Button>
      </div>
    </div>
  );
};