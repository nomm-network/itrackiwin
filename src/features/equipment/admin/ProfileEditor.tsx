import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlateTable } from '../components/PlateTable';
import { DumbbellTable } from '../components/DumbbellTable';
import { FixedBarsTable } from '../components/FixedBarsTable';
import { StackIncrementsTable } from '../components/StackIncrementsTable';
import { useCreateProfile, useEquipmentProfile, useUpdateProfile } from '../state/useEquipmentProfiles';
import { convertWeight } from '@/lib/equipment/convert';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditorProps {
  profileId?: string;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profileId,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const { data: existingProfile } = useEquipmentProfile(profileId || '');
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: '',
    unit: 'kg' as 'kg' | 'lb',
    notes: ''
  });

  const [plates, setPlates] = useState<Array<{ weight_kg: number; display_order: number; count?: number }>>([]);
  const [dumbbells, setDumbbells] = useState<Array<{ weight_kg: number; pair_count?: number }>>([]);
  const [straightBars, setStraightBars] = useState<Array<{ weight_kg: number; count?: number }>>([]);
  const [ezBars, setEzBars] = useState<Array<{ weight_kg: number; count?: number }>>([]);
  const [stackSteps, setStackSteps] = useState<number[]>([]);
  const [auxIncrements, setAuxIncrements] = useState<number[]>([]);

  const [activeTab, setActiveTab] = useState('plates');

  // Load existing profile data
  useEffect(() => {
    if (existingProfile) {
      setFormData({
        name: existingProfile.name,
        unit: existingProfile.default_unit as 'kg' | 'lb',
        notes: existingProfile.notes || ''
      });

      if (existingProfile.plate_profile_plates) {
        setPlates(existingProfile.plate_profile_plates.map((p: any) => ({
          weight_kg: p.weight_kg,
          display_order: p.display_order,
          count: 2 // Default count
        })));
      }
    }
  }, [existingProfile]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Profile name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (profileId) {
        // Update existing profile
        await updateProfile.mutateAsync({
          profileId,
          updates: {
            name: formData.name,
            notes: formData.notes
          },
          plates: plates.map(p => ({
            weight_kg: p.weight_kg,
            display_order: p.display_order
          }))
        });
      } else {
        // Create new profile
        await createProfile.mutateAsync({
          name: formData.name,
          default_unit: formData.unit,
          notes: formData.notes,
          plates: plates.map(p => ({
            weight_kg: p.weight_kg,
            display_order: p.display_order
          }))
        });
      }

      toast({
        title: 'Success',
        description: `Profile ${profileId ? 'updated' : 'created'} successfully`
      });
      onSave();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${profileId ? 'update' : 'create'} profile`,
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
      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Profile Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., EU Standard Kg, US Commercial Lb"
          />
        </div>
        <div>
          <Label htmlFor="unit">Primary Unit</Label>
          <Select 
            value={formData.unit} 
            onValueChange={(value: 'kg' | 'lb') => setFormData(prev => ({ ...prev, unit: value }))}
            disabled={!!profileId} // Don't allow changing unit on existing profiles
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
              <SelectItem value="lb">Pounds (lb)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Optional description or notes about this profile"
        />
      </div>

      {/* Equipment Configuration */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="plates">Plates</TabsTrigger>
          <TabsTrigger value="dumbbells">Dumbbells</TabsTrigger>
          <TabsTrigger value="bars">Fixed Bars</TabsTrigger>
          <TabsTrigger value="stacks">Stacks</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="plates" className="mt-6">
          <PlateTable
            plates={plates}
            unit={formData.unit}
            editable={true}
            onPlatesChange={setPlates}
          />
        </TabsContent>

        <TabsContent value="dumbbells" className="mt-6">
          <DumbbellTable
            dumbbells={dumbbells}
            unit={formData.unit}
            editable={true}
            onDumbbellsChange={setDumbbells}
          />
        </TabsContent>

        <TabsContent value="bars" className="mt-6">
          <FixedBarsTable
            straightBars={straightBars}
            ezBars={ezBars}
            unit={formData.unit}
            editable={true}
            onBarsChange={handleBarsChange}
          />
        </TabsContent>

        <TabsContent value="stacks" className="mt-6">
          <StackIncrementsTable
            stackSteps={stackSteps}
            auxIncrements={auxIncrements}
            unit={formData.unit}
            editable={true}
            onStackChange={handleStackChange}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Profile Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Name:</strong> {formData.name || 'Untitled Profile'}
              </div>
              <div>
                <strong>Unit:</strong> {formData.unit.toUpperCase()}
              </div>
              <div>
                <strong>Plates:</strong> {plates.length} types configured
              </div>
              <div>
                <strong>Dumbbells:</strong> {dumbbells.length} weights configured
              </div>
              <div>
                <strong>Fixed Bars:</strong> {straightBars.length + ezBars.length} bars configured
              </div>
              <div>
                <strong>Stack Steps:</strong> {stackSteps.length} increments configured
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={createProfile.isPending || updateProfile.isPending}
        >
          {createProfile.isPending || updateProfile.isPending ? 'Saving...' : 
           profileId ? 'Update Profile' : 'Create Profile'}
        </Button>
      </div>
    </div>
  );
};