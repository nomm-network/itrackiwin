import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Settings, Wrench } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  useGymEquipmentProfiles,
  useSetGymEquipmentProfile,
  usePlateProfiles,
  useStackProfiles,
  useEffectiveEquipmentProfile
} from '@/features/equipment/hooks/useEquipmentProfiles';

interface GymEquipmentProfilesTabProps {
  gymId: string;
}

export const GymEquipmentProfilesTab: React.FC<GymEquipmentProfilesTabProps> = ({ 
  gymId 
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedEquipmentId, setSelectedEquipmentId] = React.useState<string | null>(null);

  // Fetch equipment list
  const { data: equipment } = useQuery({
    queryKey: ['equipment-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, slug, equipment_type, kind')
        .order('slug');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: plateProfiles } = usePlateProfiles();
  const { data: stackProfiles } = useStackProfiles();
  
  const filteredEquipment = equipment?.filter(eq => 
    eq.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.equipment_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Equipment Profile Overrides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Equipment</Label>
              <Select
                value={selectedEquipmentId || "none"}
                onValueChange={(value) => setSelectedEquipmentId(value === "none" ? null : value)}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Select equipment to configure" />
              </SelectTrigger>
              <SelectContent className="bg-background border-input shadow-lg z-50 max-h-60">
                {filteredEquipment?.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.slug} ({eq.equipment_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEquipmentId && (
            <EquipmentProfileOverrideForm
              gymId={gymId}
              equipmentId={selectedEquipmentId}
              plateProfiles={plateProfiles || []}
              stackProfiles={stackProfiles || []}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface EquipmentProfileOverrideFormProps {
  gymId: string;
  equipmentId: string;
  plateProfiles: any[];
  stackProfiles: any[];
}

const EquipmentProfileOverrideForm: React.FC<EquipmentProfileOverrideFormProps> = ({
  gymId,
  equipmentId,
  plateProfiles,
  stackProfiles
}) => {
  const { data: currentOverride } = useGymEquipmentProfiles(gymId, equipmentId);
  const { data: globalProfile } = useEffectiveEquipmentProfile(equipmentId);
  const setOverrideMutation = useSetGymEquipmentProfile();

  const [plateProfileId, setPlateProfileId] = React.useState<string | null>(null);
  const [stackProfileId, setStackProfileId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    if (currentOverride) {
      setPlateProfileId(currentOverride.plate_profile_id);
      setStackProfileId(currentOverride.stack_profile_id);
      setNotes(currentOverride.notes || '');
    } else {
      // Reset to global defaults when no override exists
      setPlateProfileId(null);
      setStackProfileId(null);
      setNotes('');
    }
  }, [currentOverride]);

  const handleSave = () => {
    setOverrideMutation.mutate({
      userGymId: gymId,
      equipmentId,
      plateProfileId,
      stackProfileId,
      notes
    });
  };

  const getProfileName = (profiles: any[], id: string | null) => {
    if (!id) return 'None';
    const profile = profiles.find(p => p.id === id);
    return profile ? `${profile.name} (${profile.default_unit})` : 'Unknown';
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Global Plate Profile</Label>
            <div className="p-2 bg-muted rounded text-sm">
              {getProfileName(plateProfiles, globalProfile?.plate_profile_id)}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gym Plate Override</Label>
            <Select
              value={plateProfileId || "none"}
              onValueChange={(value) => setPlateProfileId(value === "none" ? null : value)}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Use global default" />
              </SelectTrigger>
              <SelectContent className="bg-background border-input shadow-lg z-50">
                <SelectItem value="none">Use global default</SelectItem>
                {plateProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name} ({profile.default_unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Global Stack Profile</Label>
            <div className="p-2 bg-muted rounded text-sm">
              {getProfileName(stackProfiles, globalProfile?.stack_profile_id)}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gym Stack Override</Label>
            <Select
              value={stackProfileId || "none"}
              onValueChange={(value) => setStackProfileId(value === "none" ? null : value)}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Use global default" />
              </SelectTrigger>
              <SelectContent className="bg-background border-input shadow-lg z-50">
                <SelectItem value="none">Use global default</SelectItem>
                {stackProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name} ({profile.default_unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes about this equipment configuration..."
            className="bg-background"
          />
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Mixed-unit status: ✅ Supported
          </Badge>

          <Button 
            onClick={handleSave}
            disabled={setOverrideMutation.isPending}
          >
            {setOverrideMutation.isPending ? 'Saving...' : 'Save Override'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};