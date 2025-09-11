import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Copy, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { 
  usePlateProfiles, 
  useArchivePlateProfile, 
  useDuplicatePlateProfile,
  useDeletePlateProfile
} from './hooks/usePlateProfiles';

export default function PlateProfilesPage() {
  const navigate = useNavigate();
  const { data: profiles, isLoading } = usePlateProfiles();
  const archiveMutation = useArchivePlateProfile();
  const duplicateMutation = useDuplicatePlateProfile();
  const deleteMutation = useDeletePlateProfile();

  const handleCreateNew = () => {
    navigate('/admin/plates/profiles/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/plates/profiles/${id}`);
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id);
  };

  const handleArchive = (id: string, isActive: boolean) => {
    archiveMutation.mutate({ id, is_active: !isActive });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this plate profile? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const formatPlatesSummary = (plates: any[]) => {
    if (!plates || plates.length === 0) return 'No plates';
    
    const sorted = [...plates].sort((a, b) => b.weight_kg - a.weight_kg);
    const weights = sorted.map(p => p.weight_kg).join(', ');
    return weights;
  };

  if (isLoading) {
    return (
      <div className="container py-6">
        <p className="text-muted-foreground">Loading plate profiles...</p>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plate Profiles</h1>
          <p className="text-muted-foreground">
            Manage standard plate sets that gyms can adopt
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plate Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Default Unit</TableHead>
                <TableHead>Plates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {profile.default_unit.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatPlatesSummary(profile.plate_profile_plates)} {profile.default_unit}
                  </TableCell>
                  <TableCell>
                    <Badge variant={profile.is_active ? "default" : "secondary"}>
                      {profile.is_active ? 'Active' : 'Archived'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(profile.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(profile.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(profile.id, profile.is_active)}>
                          {profile.is_active ? (
                            <><Archive className="h-4 w-4 mr-2" />Archive</>
                          ) : (
                            <><ArchiveRestore className="h-4 w-4 mr-2" />Restore</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(profile.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!profiles || profiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No plate profiles found. Create your first plate profile to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}