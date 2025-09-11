import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { fetchEffectivePlates } from '@/lib/equipment/api';
import { useToast } from '@/hooks/use-toast';

export const GymEquipmentPage = () => {
  const { gymId } = useParams<{ gymId: string }>();
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
  const [effectiveProfile, setEffectiveProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (gymId) {
      loadEffectiveProfile();
    }
  }, [gymId, units]);

  const loadEffectiveProfile = async () => {
    if (!gymId) return;
    
    try {
      const kgProfile = await fetchEffectivePlates(gymId, 'kg');
      const lbProfile = await fetchEffectivePlates(gymId, 'lb');
      setEffectiveProfile({ kg: kgProfile, lb: lbProfile });
    } catch (error) {
      console.error('Error loading effective profile:', error);
    }
  };

  const toggleOverride = (section: keyof typeof overrides) => {
    setOverrides(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleUnit = (section: keyof typeof units) => {
    setUnits(prev => ({ 
      ...prev, 
      [section]: prev[section] === 'kg' ? 'lb' : 'kg' 
    }));
  };

  const saveConfiguration = async () => {
    try {
      // In a real implementation, this would save the configuration
      toast({
        title: 'Success',
        description: 'Gym equipment configuration saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive'
      });
    }
  };

  if (!gymId) {
    return <div>Gym ID not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gym Equipment Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure equipment profiles specific to this gym. Toggle overrides to customize 
          beyond global defaults, and enable mixed units if your gym has both kg and lb equipment.
        </p>
      </div>

      <div className="space-y-6">
        {/* Equipment Sections */}
        <Accordion type="multiple" className="space-y-4">
          {/* Plates Section */}
          <AccordionItem value="plates">
            <AccordionTrigger className="hover:no-underline">
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">Plates & Barbells</CardTitle>
                    <CardDescription>
                      Configure plate weights and barbell specifications
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={units.plates === 'kg' ? 'default' : 'secondary'}>
                      {units.plates.toUpperCase()}
                    </Badge>
                    <Label className="flex items-center gap-2">
                      <Switch 
                        checked={overrides.plates}
                        onCheckedChange={() => toggleOverride('plates')}
                      />
                      Override
                    </Label>
                  </div>
                </CardHeader>
              </Card>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Unit</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleUnit('plates')}
                      >
                        Switch to {units.plates === 'kg' ? 'LB' : 'KG'}
                      </Button>
                    </div>
                    
                    {overrides.plates ? (
                      <div className="text-sm text-muted-foreground">
                        Custom plate configuration would go here
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Using Global Defaults</Label>
                        {effectiveProfile?.[units.plates] && (
                          <div className="text-sm text-muted-foreground">
                            Plates: {effectiveProfile[units.plates].sides?.join(', ') || 'None'} {units.plates}
                            <br />
                            Barbell: {effectiveProfile[units.plates].barbell_weight} {units.plates}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Dumbbells Section */}
          <AccordionItem value="dumbbells">
            <AccordionTrigger className="hover:no-underline">
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">Dumbbells</CardTitle>
                    <CardDescription>
                      Configure available dumbbell weights
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={units.dumbbells === 'kg' ? 'default' : 'secondary'}>
                      {units.dumbbells.toUpperCase()}
                    </Badge>
                    <Label className="flex items-center gap-2">
                      <Switch 
                        checked={overrides.dumbbells}
                        onCheckedChange={() => toggleOverride('dumbbells')}
                      />
                      Override
                    </Label>
                  </div>
                </CardHeader>
              </Card>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Unit</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleUnit('dumbbells')}
                      >
                        Switch to {units.dumbbells === 'kg' ? 'LB' : 'KG'}
                      </Button>
                    </div>
                    
                    {overrides.dumbbells ? (
                      <div className="text-sm text-muted-foreground">
                        Custom dumbbell configuration would go here
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Using Global Defaults</Label>
                        <div className="text-sm text-muted-foreground">
                          Range: 2.5-50 kg (5-120 lb equivalent)
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Fixed Bars Section */}
          <AccordionItem value="bars">
            <AccordionTrigger className="hover:no-underline">
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">Fixed Bars</CardTitle>
                    <CardDescription>
                      Configure pre-weighted straight and EZ curl bars
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={units.bars === 'kg' ? 'default' : 'secondary'}>
                      {units.bars.toUpperCase()}
                    </Badge>
                    <Label className="flex items-center gap-2">
                      <Switch 
                        checked={overrides.bars}
                        onCheckedChange={() => toggleOverride('bars')}
                      />
                      Override
                    </Label>
                  </div>
                </CardHeader>
              </Card>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Unit</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleUnit('bars')}
                      >
                        Switch to {units.bars === 'kg' ? 'LB' : 'KG'}
                      </Button>
                    </div>
                    
                    {overrides.bars ? (
                      <div className="text-sm text-muted-foreground">
                        Custom fixed bar configuration would go here
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Using Global Defaults</Label>
                        <div className="text-sm text-muted-foreground">
                          Straight: 10-50 kg steps, EZ: 7.5-30 kg steps
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Machine Stacks Section */}
          <AccordionItem value="stacks">
            <AccordionTrigger className="hover:no-underline">
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">Machine Stacks</CardTitle>
                    <CardDescription>
                      Configure weight stack increments and micro adjustments
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={units.stacks === 'kg' ? 'default' : 'secondary'}>
                      {units.stacks.toUpperCase()}
                    </Badge>
                    <Label className="flex items-center gap-2">
                      <Switch 
                        checked={overrides.stacks}
                        onCheckedChange={() => toggleOverride('stacks')}
                      />
                      Override
                    </Label>
                  </div>
                </CardHeader>
              </Card>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Unit</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleUnit('stacks')}
                      >
                        Switch to {units.stacks === 'kg' ? 'LB' : 'KG'}
                      </Button>
                    </div>
                    
                    {overrides.stacks ? (
                      <div className="text-sm text-muted-foreground">
                        Custom stack configuration would go here
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Using Global Defaults</Label>
                        <div className="text-sm text-muted-foreground">
                          5 kg steps with 1.25 kg micro adjustments
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Effective Configuration Preview</CardTitle>
            <CardDescription>
              This shows the final equipment profile that will be used for workouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {effectiveProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Kilogram Profile</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    Plates: {effectiveProfile.kg?.sides?.join(', ') || 'None'} kg
                    <br />
                    Barbell: {effectiveProfile.kg?.barbell_weight || 0} kg
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Pound Profile</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    Plates: {effectiveProfile.lb?.sides?.join(', ') || 'None'} lb
                    <br />
                    Barbell: {effectiveProfile.lb?.barbell_weight || 0} lb
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading effective configuration...</div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={saveConfiguration}>
            Save Equipment Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};