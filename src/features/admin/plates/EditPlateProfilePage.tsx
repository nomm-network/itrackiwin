import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { PlateRow } from './components/PlateRow';
import { 
  usePlateProfile, 
  useUpsertPlateProfile, 
  useDeletePlateProfile,
  PlateProfile, 
  PlateProfilePlate 
} from './hooks/usePlateProfiles';

export default function EditPlateProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const { data: profile, isLoading } = usePlateProfile(id || '');
  const upsertMutation = useUpsertPlateProfile();
  const deleteMutation = useDeletePlateProfile();

  const [formData, setFormData] = useState<PlateProfile>({
    name: '',
    default_unit: 'kg',
    notes: '',
    is_active: true,
    plate_profile_plates: []
  });

  useEffect(() => {
    if (profile && !isNew) {
      setFormData({
        id: profile.id,
        name: profile.name,
        default_unit: profile.default_unit,
        notes: profile.notes || '',
        is_active: profile.is_active,
        plate_profile_plates: profile.plate_profile_plates?.map(p => ({
          id: p.id,
          weight_kg: p.weight_kg,
          count_per_side: p.count_per_side,
          display_order: p.display_order
        })) || []
      });
    }
  }, [profile, isNew]);

  const handleSave = () => {
    upsertMutation.mutate(formData, {
      onSuccess: (profileId) => {
        navigate('/admin/plates/profiles');
      }
    });
  };

  const handleDelete = () => {
    if (id && confirm('Are you sure you want to delete this plate profile? This action cannot be undone.')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          navigate('/admin/plates/profiles');
        }
      });
    }
  };

  const addPlate = () => {
    const newPlate: PlateProfilePlate = {
      weight_kg: 20,
      count_per_side: 2,
      display_order: formData.plate_profile_plates?.length || 0
    };
    
    setFormData(prev => ({
      ...prev,
      plate_profile_plates: [...(prev.plate_profile_plates || []), newPlate]
    }));
  };

  const updatePlate = (index: number, field: keyof PlateProfilePlate, value: any) => {
    setFormData(prev => ({
      ...prev,
      plate_profile_plates: prev.plate_profile_plates?.map((plate, i) => 
        i === index ? { ...plate, [field]: value } : plate
      ) || []
    }));
  };

  const deletePlate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      plate_profile_plates: prev.plate_profile_plates?.filter((_, i) => i !== index) || []
    }));
  };

  const addQuickSet = (type: 'eu_kg' | 'us_lb') => {
    const quickSets = {
      eu_kg: [
        { weight_kg: 25, count_per_side: 2, display_order: 0 },
        { weight_kg: 20, count_per_side: 2, display_order: 1 },
        { weight_kg: 15, count_per_side: 2, display_order: 2 },
        { weight_kg: 10, count_per_side: 2, display_order: 3 },
        { weight_kg: 5, count_per_side: 2, display_order: 4 },
        { weight_kg: 2.5, count_per_side: 2, display_order: 5 },
        { weight_kg: 1.25, count_per_side: 2, display_order: 6 }
      ],
      us_lb: [
        { weight_kg: 20.41, count_per_side: 2, display_order: 0 }, // 45 lb
        { weight_kg: 15.88, count_per_side: 2, display_order: 1 }, // 35 lb
        { weight_kg: 11.34, count_per_side: 2, display_order: 2 }, // 25 lb
        { weight_kg: 4.54, count_per_side: 2, display_order: 3 },  // 10 lb
        { weight_kg: 2.27, count_per_side: 2, display_order: 4 },  // 5 lb
        { weight_kg: 1.13, count_per_side: 2, display_order: 5 }   // 2.5 lb
      ]
    };

    setFormData(prev => ({
      ...prev,
      plate_profile_plates: quickSets[type]
    }));
  };

  if (isLoading && !isNew) {
    return (
      <div className="container py-6">
        <p className="text-muted-foreground">Loading plate profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/plates/profiles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profiles
        </Button>
        <h1 className="text-3xl font-bold">
          {isNew ? 'Create Plate Profile' : 'Edit Plate Profile'}
        </h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., EU Standard KG"
                />
              </div>
              <div>
                <Label htmlFor="unit">Default Unit</Label>
                <Select 
                  value={formData.default_unit} 
                  onValueChange={(value: 'kg' | 'lb') => setFormData(prev => ({ ...prev, default_unit: value }))}
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
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this plate profile..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plate Configuration</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => addQuickSet('eu_kg')}>
                  EU Standard KG
                </Button>
                <Button variant="outline" size="sm" onClick={() => addQuickSet('us_lb')}>
                  US Standard LB
                </Button>
                <Button variant="outline" size="sm" onClick={addPlate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Plate
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.plate_profile_plates?.map((plate, index) => (
              <PlateRow
                key={index}
                plate={plate}
                index={index}
                defaultUnit={formData.default_unit}
                onUpdate={updatePlate}
                onDelete={deletePlate}
              />
            ))}
            
            {(!formData.plate_profile_plates || formData.plate_profile_plates.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No plates configured yet.</p>
                <p>Use the quick-add buttons or add plates manually.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div>
            {!isNew && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete Profile
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/plates/profiles')}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.name || upsertMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {upsertMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}