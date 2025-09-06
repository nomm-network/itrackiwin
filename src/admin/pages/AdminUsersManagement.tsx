import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
  mentor?: {
    role_key: 'mentor' | 'coach';
    bio?: string;
    avatar_url?: string;
  };
}

const AdminUsersManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterMentorType, setFilterMentorType] = useState<'all' | 'mentor' | 'coach' | 'none'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch users with mentor data
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get auth users for email
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      // Get users data for country/city
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, country, city, created_at');
      if (usersError) throw usersError;

      // Get mentors data separately
      const { data: mentors, error: mentorsError } = await supabase
        .from('mentor_profiles')
        .select('user_id, role_key, bio, avatar_url');
      if (mentorsError) throw mentorsError;

      return (authUsers?.users || []).map((user: any) => {
        const userData = usersData?.find((u: any) => u.id === user.id);
        return {
          id: user.id,
          email: user.email || 'Unknown',
          created_at: user.created_at,
          country: userData?.country,
          city: userData?.city,
          mentor: (mentors || []).find((m: any) => m.user_id === user.id) || null
        };
      });
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // First create the auth user
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if (error) throw error;

      // Then create the users table entry
      if (data.user) {
        const { error: usersError } = await supabase
          .from('users')
          .insert({ 
            id: data.user.id,
            is_pro: false
          });
        if (usersError) throw usersError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsCreateDialogOpen(false);
      toast({ title: 'User created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating user', description: error.message, variant: 'destructive' });
    }
  });

  // Toggle mentor status mutation
  const toggleMentorMutation = useMutation({
    mutationFn: async ({ userId, mentorType, enable }: { userId: string; mentorType: 'mentor' | 'coach'; enable: boolean }) => {
      if (enable) {
        // Get fitness category as default
        const { data: fitnessCategory } = await supabase
          .from('life_categories')
          .select('id')
          .eq('slug', 'fitness')
          .single();
        
        const { error } = await supabase
          .from('mentor_profiles')
          .upsert({ 
            user_id: userId, 
            role_key: mentorType,
            type: mentorType, // Required field - mentor_type enum
            life_category_id: fitnessCategory?.id,
            bio: '',
            avatar_url: null,
            is_approved: false,
            is_public: true,
            accepts_clients: true
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mentor_profiles')
          .delete()
          .eq('user_id', userId)
          .eq('role_key', mentorType);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Mentor status updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating mentor status', description: error.message, variant: 'destructive' });
    }
  });

  const CreateUserForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createUserMutation.mutate({ email, password });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" disabled={createUserMutation.isPending}>
          {createUserMutation.isPending ? 'Creating...' : 'Create User'}
        </Button>
      </form>
    );
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterMentorType === 'all' ||
      (filterMentorType === 'none' && !user.mentor) ||
      (filterMentorType !== 'none' && user.mentor && user.mentor.role_key === filterMentorType);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Manage users and their mentor status</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <CreateUserForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by email</Label>
              <Input
                id="search"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filter">Filter by mentor type</Label>
              <Select value={filterMentorType} onValueChange={(value: any) => setFilterMentorType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="mentor">Mentors</SelectItem>
                  <SelectItem value="coach">Coaches</SelectItem>
                  <SelectItem value="none">Regular Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.city && user.country ? `${user.city}, ${user.country}` : 
                       user.country ? user.country : 
                       user.city ? user.city : 'Not specified'}
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.mentor ? (
                        <Badge variant="default" className="capitalize">
                          {user.mentor.role_key}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Regular User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`mentor-${user.id}`} className="text-sm">Mentor</Label>
                          <Switch
                            id={`mentor-${user.id}`}
                            checked={user.mentor && user.mentor.role_key === 'mentor'}
                            onCheckedChange={(checked) => 
                              toggleMentorMutation.mutate({ 
                                userId: user.id, 
                                mentorType: 'mentor', 
                                enable: checked 
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`coach-${user.id}`} className="text-sm">Coach</Label>
                          <Switch
                            id={`coach-${user.id}`}
                            checked={user.mentor && user.mentor.role_key === 'coach'}
                            onCheckedChange={(checked) => 
                              toggleMentorMutation.mutate({ 
                                userId: user.id, 
                                mentorType: 'coach', 
                                enable: checked 
                              })
                            }
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersManagement;