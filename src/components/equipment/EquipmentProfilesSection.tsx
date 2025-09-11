import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Link } from 'lucide-react';
import { 
  useEquipmentProfiles, 
  useSetEquipmentProfile, 
  usePlateProfiles, 
  useStackProfiles 
} from '@/features/equipment/hooks/useEquipmentProfiles';

interface EquipmentProfilesSectionProps {
  equipmentId: string;
}

export const EquipmentProfilesSection: React.FC<EquipmentProfilesSectionProps> = ({ 
  equipmentId 
}) => {
  const { data: currentProfiles } = useEquipmentProfiles(equipmentId);
  const { data: plateProfiles } = usePlateProfiles();
  const { data: stackProfiles } = useStackProfiles();
  const setProfileMutation = useSetEquipmentProfile();

  const [selectedPlateProfile, setSelectedPlateProfile] = React.useState<string | null>(null);
  const [selectedStackProfile, setSelectedStackProfile] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (currentProfiles) {
      setSelectedPlateProfile(currentProfiles.plate_profile_id || null);
      setSelectedStackProfile(currentProfiles.stack_profile_id || null);
    }
  }, [currentProfiles]);

  const handleSave = () => {
    setProfileMutation.mutate({
      equipmentId,
      plateProfileId: selectedPlateProfile,
      stackProfileId: selectedStackProfile
    });
  };

  const hasChanges = 
    selectedPlateProfile !== (currentProfiles?.plate_profile_id || null) ||
    selectedStackProfile !== (currentProfiles?.stack_profile_id || null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-4 w-4" />
          Equipment Profiles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Plate Profile</Label>
            <Select
              value={selectedPlateProfile || "none"}
              onValueChange={(value) => setSelectedPlateProfile(value === "none" ? null : value)}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Select plate profile" />
              </SelectTrigger>
              <SelectContent className="bg-background border-input shadow-lg z-50">
                <SelectItem value="none">None</SelectItem>
                {plateProfiles?.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name} ({profile.default_unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Stack Profile</Label>
            <Select
              value={selectedStackProfile || "none"}
              onValueChange={(value) => setSelectedStackProfile(value === "none" ? null : value)}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Select stack profile" />
              </SelectTrigger>
              <SelectContent className="bg-background border-input shadow-lg z-50">
                <SelectItem value="none">None</SelectItem>
                {stackProfiles?.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name} ({profile.default_unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Mixed-unit inventory supported ✅
          </Badge>

          {hasChanges && (
            <Button 
              onClick={handleSave}
              disabled={setProfileMutation.isPending}
              size="sm"
            >
              {setProfileMutation.isPending ? 'Saving...' : 'Save Profiles'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};