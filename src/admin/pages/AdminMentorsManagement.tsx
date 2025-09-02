import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Mentor {
  user_id: string;
  mentor_type: 'mentor' | 'coach';
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  email?: string;
  categories?: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
}

const AdminMentorsManagement: React.FC = () => {
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'mentor' | 'coach'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const queryClient = useQueryClient();

  // Fetch mentors with categories and user data
  const { data: mentors, isLoading } = useQuery({
    queryKey: ['admin-mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentors')
        .select(`
          user_id, 
          mentor_type, 
          bio, 
          avatar_url, 
          created_at, 
          updated_at,
          country,
          city,
          gym_id
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get auth users for email
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      // Get gyms data for coaches
      const { data: gyms, error: gymsError } = await supabase
        .from('gyms')
        .select('id, name, city, country');
      if (gymsError) throw gymsError;

      return (data || []).map((mentor: any) => ({
        ...mentor,
        email: authUsers?.users?.find((au: any) => au.id === mentor.user_id)?.email || 'Unknown',
        gym: mentor.gym_id ? gyms?.find((g: any) => g.id === mentor.gym_id) : null,
        categories: []
      }));
    }
  });

  // Fetch life categories for editing
  const { data: lifeCategories } = useQuery({
    queryKey: ['life-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('life_categories')
        .select('id, slug, icon, display_order')
        .order('display_order');
      
      if (error) throw error;
      return data.map(cat => ({ ...cat, name: cat.slug }));
    }
  });

  // Update mentor mutation
  const updateMentorMutation = useMutation({
    mutationFn: async ({ mentorData, categoryIds }: { mentorData: Partial<Mentor>; categoryIds: string[] }) => {
      const { user_id, ...updateData } = mentorData;
      
      // Update mentor
      const { error: mentorError } = await supabase
        .from('mentors')
        .update(updateData)
        .eq('user_id', user_id);
      
      if (mentorError) throw mentorError;

      // Update categories
      await supabase
        .from('mentor_categories')
        .delete()
        .eq('mentor_id', user_id);

      if (categoryIds.length > 0) {
        const { error: categoryError } = await supabase
          .from('mentor_categories')
          .insert(
            categoryIds.map(categoryId => ({
              mentor_id: user_id,
              category_id: categoryId
            }))
          );
        
        if (categoryError) throw categoryError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mentors'] });
      setEditingMentor(null);
      toast({ title: 'Mentor updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating mentor', description: error.message, variant: 'destructive' });
    }
  });

  // Delete mentor mutation
  const deleteMentorMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('mentors')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mentors'] });
      toast({ title: 'Mentor deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting mentor', description: error.message, variant: 'destructive' });
    }
  });

  const EditMentorForm = ({ mentor }: { mentor: Mentor }) => {
    const [bio, setBio] = useState(mentor.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(mentor.avatar_url || '');
    const [mentorType, setMentorType] = useState<'mentor' | 'coach'>(mentor.mentor_type);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
      mentor.categories?.map(c => c.id) || []
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateMentorMutation.mutate({
        mentorData: {
          user_id: mentor.user_id,
          bio,
          avatar_url: avatarUrl,
          mentor_type: mentorType
        },
        categoryIds: selectedCategories
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="mentor-type">Mentor Type</Label>
          <Select value={mentorType} onValueChange={(value: 'mentor' | 'coach') => setMentorType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mentor">Mentor</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Enter mentor bio..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="avatar-url">Avatar URL</Label>
          <Input
            id="avatar-url"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div>
          <Label>Categories</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {lifeCategories?.map(category => (
              <label key={category.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, category.id]);
                    } else {
                      setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                    }
                  }}
                />
                <span className="text-sm">
                  {category.icon} {category.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={updateMentorMutation.isPending}>
          {updateMentorMutation.isPending ? 'Updating...' : 'Update Mentor'}
        </Button>
      </form>
    );
  };

  const filteredMentors = mentors?.filter(mentor => {
    const matchesSearch = mentor.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || mentor.mentor_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mentors Management</h1>
          <p className="text-muted-foreground">Manage mentors and coaches</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search mentors</Label>
              <Input
                id="search"
                placeholder="Search by email or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filter">Filter by type</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="mentor">Mentors</SelectItem>
                  <SelectItem value="coach">Coaches</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentors Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading mentors...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMentors?.map(mentor => (
                  <TableRow key={mentor.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={mentor.avatar_url} />
                          <AvatarFallback>
                            {mentor.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{mentor.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(mentor.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="capitalize">
                        {mentor.mentor_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {mentor.categories?.map(category => (
                          <Badge key={category.id} variant="outline" className="text-xs">
                            {category.icon} {category.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm">
                        {mentor.bio || 'No bio'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setEditingMentor(mentor)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Mentor</DialogTitle>
                            </DialogHeader>
                            {editingMentor && <EditMentorForm mentor={editingMentor} />}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMentorMutation.mutate(mentor.user_id)}
                          disabled={deleteMentorMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

export default AdminMentorsManagement;