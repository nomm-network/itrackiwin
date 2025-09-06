import React, { useState } from 'react';
import { useGymAdmins, useAssignGymAdmin } from '@/hooks/useGymAdmins';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Users, Plus, Crown, Shield, User } from 'lucide-react';

interface GymAdminsTabProps {
  gymId: string;
  isAdmin: boolean | null;
}

export default function GymAdminsTab({ gymId, isAdmin }: GymAdminsTabProps) {
  const { data: admins, isLoading, error } = useGymAdmins(gymId);
  const assignAdmin = useAssignGymAdmin();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    role: 'staff'
  });

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignAdmin.mutateAsync({
        gymId,
        userId: formData.userId,
        role: formData.role,
      });
      setIsAddDialogOpen(false);
      setFormData({ userId: '', role: 'staff' });
    } catch (error) {
      console.error('Failed to assign admin:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'staff':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'staff':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gym Administrators</h3>
          <p className="text-sm text-muted-foreground">Manage who can administrate this gym</p>
        </div>
        
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Gym Administrator</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAssignAdmin} className="space-y-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="Enter user ID"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the UUID of the user you want to make an admin
                  </p>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={assignAdmin.isPending}>
                    {assignAdmin.isPending ? 'Adding...' : 'Add Admin'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Admins List */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading administrators...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && admins && (
        <>
          <div className="grid gap-4">
            {admins.map((admin) => (
              <Card key={`${admin.gym_id}-${admin.user_id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(admin.role)}
                        <span className="font-medium">{admin.user_id.substring(0, 8)}...</span>
                      </div>
                      <Badge variant="outline" className={getRoleColor(admin.role)}>
                        {admin.role}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Added {new Date(admin.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {admins.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-3">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-medium">No administrators yet</h3>
                  <p className="text-muted-foreground">Add administrators to help manage this gym.</p>
                  {isAdmin && (
                    <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Admin
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}