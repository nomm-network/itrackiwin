import { useState } from 'react';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMyGym } from '../hooks/useMyGym.hook';

const MyGymPage = () => {
  const { toast } = useToast();
  const { 
    gym, 
    inventory, 
    isLoading,
    addDumbbell,
    addPlate,
    addMachine,
    removeDumbbell,
    removePlate,
    removeMachine
  } = useMyGym();

  const [newDumbbell, setNewDumbbell] = useState({ weight: '', quantity: 2 });
  const [newPlate, setNewPlate] = useState({ weight: '', quantity: 2 });
  const [newMachine, setNewMachine] = useState({ 
    label: '', 
    stackValues: '', 
    auxValues: '' 
  });

  if (isLoading) {
    return <div className="p-4">Loading gym setup...</div>;
  }

  const handleAddDumbbell = async () => {
    if (!newDumbbell.weight) return;
    
    try {
      await addDumbbell({
        weight: parseFloat(newDumbbell.weight),
        quantity: newDumbbell.quantity,
        unit: 'kg'
      });
      setNewDumbbell({ weight: '', quantity: 2 });
      toast({ title: 'Dumbbell added to gym inventory' });
    } catch (error) {
      toast({ 
        title: 'Failed to add dumbbell', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const handleAddPlate = async () => {
    if (!newPlate.weight) return;
    
    try {
      await addPlate({
        weight: parseFloat(newPlate.weight),
        quantity: newPlate.quantity,
        unit: 'kg'
      });
      setNewPlate({ weight: '', quantity: 2 });
      toast({ title: 'Plate added to gym inventory' });
    } catch (error) {
      toast({ 
        title: 'Failed to add plate', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const handleAddMachine = async () => {
    if (!newMachine.label || !newMachine.stackValues) return;
    
    try {
      const stackValues = newMachine.stackValues
        .split(',')
        .map(v => parseFloat(v.trim()))
        .filter(v => !isNaN(v));
      
      const auxValues = newMachine.auxValues
        ? newMachine.auxValues.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
        : [];

      await addMachine({
        label: newMachine.label,
        stackValues,
        auxValues,
        unit: 'kg'
      });
      setNewMachine({ label: '', stackValues: '', auxValues: '' });
      toast({ title: 'Machine added to gym inventory' });
    } catch (error) {
      toast({ 
        title: 'Failed to add machine', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Gym Setup</h1>
        <p className="text-muted-foreground">
          Configure your gym equipment for personalized workout generation
        </p>
      </div>

      {gym && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {gym.name}
              {gym.is_default && <Badge>Default</Badge>}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="dumbbells" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dumbbells">Dumbbells</TabsTrigger>
          <TabsTrigger value="plates">Plates & Bars</TabsTrigger>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dumbbells" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Dumbbell</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="db-weight">Weight (kg)</Label>
                  <Input
                    id="db-weight"
                    type="number"
                    step="0.5"
                    value={newDumbbell.weight}
                    onChange={(e) => setNewDumbbell({ ...newDumbbell, weight: e.target.value })}
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <Label htmlFor="db-quantity">Quantity</Label>
                  <Input
                    id="db-quantity"
                    type="number"
                    value={newDumbbell.quantity}
                    onChange={(e) => setNewDumbbell({ ...newDumbbell, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddDumbbell} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2">
            {inventory?.dumbbells.map((db, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <span className="font-medium">{db.weight} kg</span>
                    <span className="text-muted-foreground ml-2">
                      ({db.quantity} {db.quantity === 1 ? 'piece' : 'pieces'})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDumbbell(db.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Plate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="plate-weight">Weight (kg)</Label>
                  <Input
                    id="plate-weight"
                    type="number"
                    step="0.25"
                    value={newPlate.weight}
                    onChange={(e) => setNewPlate({ ...newPlate, weight: e.target.value })}
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <Label htmlFor="plate-quantity">Quantity</Label>
                  <Input
                    id="plate-quantity"
                    type="number"
                    value={newPlate.quantity}
                    onChange={(e) => setNewPlate({ ...newPlate, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddPlate} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2">
            {inventory?.plates.map((plate, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <span className="font-medium">{plate.weight} kg</span>
                    <span className="text-muted-foreground ml-2">
                      ({plate.quantity} plates)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlate(plate.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="machines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Machine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="machine-label">Machine Label</Label>
                <Input
                  id="machine-label"
                  value={newMachine.label}
                  onChange={(e) => setNewMachine({ ...newMachine, label: e.target.value })}
                  placeholder="Lat Pulldown #1"
                />
              </div>
              <div>
                <Label htmlFor="machine-stack">Stack Values (kg, comma-separated)</Label>
                <Input
                  id="machine-stack"
                  value={newMachine.stackValues}
                  onChange={(e) => setNewMachine({ ...newMachine, stackValues: e.target.value })}
                  placeholder="36, 41, 46, 51, 57, 62, 68"
                />
              </div>
              <div>
                <Label htmlFor="machine-aux">Add-on Weights (optional)</Label>
                <Input
                  id="machine-aux"
                  value={newMachine.auxValues}
                  onChange={(e) => setNewMachine({ ...newMachine, auxValues: e.target.value })}
                  placeholder="1, 2"
                />
              </div>
              <Button onClick={handleAddMachine} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Machine
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-2">
            {inventory?.machines.map((machine, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{machine.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMachine(machine.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Stack: {machine.stack_values.join(', ')} kg
                    {machine.aux_values.length > 0 && (
                      <div>Add-ons: {machine.aux_values.join(', ')} kg</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lifting Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Prefer smallest increment</Label>
                  <p className="text-sm text-muted-foreground">
                    Use the smallest available weight increments for progression
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow mixed plates</Label>
                  <p className="text-sm text-muted-foreground">
                    Mix different plate sizes to hit target weights
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyGymPage;