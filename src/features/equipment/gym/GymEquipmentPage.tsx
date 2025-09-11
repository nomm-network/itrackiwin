import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, RefreshCw } from 'lucide-react';
import { useGymEquipment, useGlobalProfiles, useAdoptProfile } from '../state/useEquipmentProfiles';
import { GymEquipmentEditor } from './GymEquipmentEditor';
import { useToast } from '@/hooks/use-toast';

export const GymEquipmentPage = () => {
  const { gymId } = useParams<{ gymId: string }>();
  const { toast } = useToast();
  const { data: gymEquipment, isLoading } = useGymEquipment(gymId || '');
  const { data: globalProfiles } = useGlobalProfiles();
  const adoptProfile = useAdoptProfile();
  const [showEditor, setShowEditor] = useState(false);
  const [showAdoptDialog, setShowAdoptDialog] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState('');

  const handleAdoptProfile = async () => {
    if (!gymId || !selectedProfileId) return;

    try {
      await adoptProfile.mutateAsync({
        gymId,
        profileId: selectedProfileId
      });
      toast({
        title: 'Success',
        description: 'Global profile adopted successfully'
      });
      setShowAdoptDialog(false);
      setSelectedProfileId('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to adopt profile',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading gym equipment configuration...</div>
      </div>
    );
  }

  if (!gymId) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-muted-foreground">Gym ID not found</div>
      </div>
    );
  }

  const adoptedProfile = gymEquipment?.plate_profiles;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gym Equipment Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure equipment profiles specific to this gym. Adopt global profiles 
          or create custom overrides for plates, dumbbells, and machines.
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Configuration</span>
              <div className="flex gap-2">
                <Dialog open={showAdoptDialog} onOpenChange={setShowAdoptDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Change Global Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adopt Global Profile</DialogTitle>
                      <DialogDescription>
                        Select a global equipment profile to adopt for this gym. 
                        This will replace the current configuration.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a global profile" />
                          </SelectTrigger>
                          <SelectContent>
                            {globalProfiles?.map((profile) => (
                              <SelectItem key={profile.id} value={profile.id}>
                                {profile.name} ({profile.default_unit.toUpperCase()})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAdoptDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAdoptProfile}
                          disabled={!selectedProfileId || adoptProfile.isPending}
                        >
                          {adoptProfile.isPending ? 'Adopting...' : 'Adopt Profile'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button onClick={() => setShowEditor(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Override Equipment
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Equipment profile currently in use for this gym
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adoptedProfile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">{adoptedProfile.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Global profile adopted on {new Date(gymEquipment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={adoptedProfile.default_unit === 'kg' ? 'default' : 'secondary'}>
                    {adoptedProfile.default_unit.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">Global</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Plates:</span> Available
                  </div>
                  <div>
                    <span className="font-medium">Unit:</span> {adoptedProfile.default_unit.toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium">Overrides:</span> {gymEquipment.allows_mixed_units ? 'Yes' : 'None'}
                  </div>
                </div>

                {adoptedProfile.notes && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Notes:</span> {adoptedProfile.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No profile adopted</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This gym hasn't adopted a global equipment profile yet.
                </p>
                <Button onClick={() => setShowAdoptDialog(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Adopt Global Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Plates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adoptedProfile ? '✓' : '0'}
              </div>
              <div className="text-xs text-muted-foreground">Types configured</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Mixed Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gymEquipment?.allows_mixed_units ? 'Yes' : 'No'}
              </div>
              <div className="text-xs text-muted-foreground">kg & lb support</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Dumbbells</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gymEquipment?.dumbbell_sets ? '✓' : '—'}
              </div>
              <div className="text-xs text-muted-foreground">Range configured</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Stacks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gymEquipment?.stack_profiles ? '✓' : '—'}
              </div>
              <div className="text-xs text-muted-foreground">Increments set</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Equipment Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Equipment Overrides</DialogTitle>
            <DialogDescription>
              Customize equipment settings specific to this gym. These overrides 
              will take precedence over the adopted global profile.
            </DialogDescription>
          </DialogHeader>
          <GymEquipmentEditor 
            gymId={gymId}
            onSave={() => setShowEditor(false)}
            onCancel={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};