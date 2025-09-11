import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Copy, Edit, Trash2 } from 'lucide-react';
import { useGlobalProfiles, useCloneProfile, useDeleteProfile } from '../state/useEquipmentProfiles';
import { ProfileEditor } from './ProfileEditor';
import { useToast } from '@/hooks/use-toast';

export const GlobalEquipmentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: profiles, isLoading } = useGlobalProfiles();
  const cloneProfile = useCloneProfile();
  const deleteProfile = useDeleteProfile();
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCloneProfile = async (profileId: string, originalName: string) => {
    try {
      await cloneProfile.mutateAsync({
        profileId,
        newName: `${originalName} (Copy)`
      });
      toast({
        title: 'Success',
        description: 'Profile cloned successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clone profile',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProfile.mutateAsync(profileId);
      toast({
        title: 'Success',
        description: 'Profile deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete profile',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading equipment profiles...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Global Equipment Profiles</h1>
        <p className="text-muted-foreground mt-2">
          Manage default equipment profiles that serve as templates for gyms worldwide. 
          Each profile defines standard plate configurations, dumbbells, and equipment constraints.
        </p>
      </div>

      <div className="mb-6">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Equipment Profile</DialogTitle>
              <DialogDescription>
                Create a new global equipment profile that gyms can adopt as their default configuration.
              </DialogDescription>
            </DialogHeader>
            <ProfileEditor 
              onSave={() => setShowCreateDialog(false)}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Profiles</CardTitle>
          <CardDescription>
            Global profiles available for gym adoption
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profiles && profiles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Plates</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell>
                      <Badge variant={profile.default_unit === 'kg' ? 'default' : 'secondary'}>
                        {profile.default_unit.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {profile.plate_profile_plates?.length || 0} plate types
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Edit Equipment Profile</DialogTitle>
                              <DialogDescription>
                                Modify the equipment profile configuration.
                              </DialogDescription>
                            </DialogHeader>
                            <ProfileEditor 
                              profileId={profile.id}
                              onSave={() => {}}
                              onCancel={() => {}}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCloneProfile(profile.id, profile.name)}
                          disabled={cloneProfile.isPending}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteProfile(profile.id)}
                          disabled={deleteProfile.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No profiles created yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first global equipment profile to get started.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};