import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Trash2, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useMentor } from './hooks/useMentors';
import { useUpsertMentor, UpsertMentorPayload } from './hooks/useUpsertMentor';
import { useDeleteMentor } from './hooks/useDeleteMentor';

const AdminMentorEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: mentor, isLoading } = useMentor(id);
  const upsertMentor = useUpsertMentor();
  const deleteMentor = useDeleteMentor();

  const [formData, setFormData] = useState<UpsertMentorPayload>({
    user_id: '',
    mentor_type: 'mentor',
    primary_category_id: '',
    is_public: true,
    display_name: '',
    bio: '',
    hourly_rate: 0,
  });

  useEffect(() => {
    if (mentor && !isNew) {
      setFormData({
        id: mentor.id,
        user_id: mentor.user_id,
        mentor_type: mentor.mentor_type,
        primary_category_id: mentor.primary_category_id || '',
        is_public: mentor.is_public,
        display_name: mentor.display_name || '',
        bio: mentor.bio || '',
        hourly_rate: mentor.hourly_rate || 0,
      });
    }
  }, [mentor, isNew]);

  const handleSave = () => {
    const payload = { ...formData };
    
    // Clean up empty values
    if (!payload.primary_category_id) delete payload.primary_category_id;
    if (!payload.bio) delete payload.bio;
    if (!payload.hourly_rate) delete payload.hourly_rate;

    upsertMentor.mutate(payload, {
      onSuccess: (data) => {
        if (isNew && data && data.length > 0) {
          // Redirect to edit page with the new ID
          navigate(`/admin/mentors/${data[0].id}`);
        }
      },
    });
  };

  const handleDelete = () => {
    if (mentor?.id) {
      deleteMentor.mutate(mentor.id, {
        onSuccess: () => {
          navigate('/admin/mentors');
        },
      });
    }
  };

  const handleBack = () => {
    navigate('/admin/mentors');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isNew ? 'New Mentor' : 'Edit Mentor'}
          </h1>
          <p className="text-muted-foreground">
            {isNew ? 'Create a new mentor profile' : 'Modify mentor details'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mentor Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">User ID *</Label>
              <Input
                id="user_id"
                value={formData.user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                placeholder="Enter user UUID"
                disabled={!isNew}
              />
              {!isNew && (
                <p className="text-xs text-muted-foreground">User ID cannot be changed after creation</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mentor_type">Type *</Label>
              <Select 
                value={formData.mentor_type} 
                onValueChange={(value: 'mentor' | 'coach') => 
                  setFormData(prev => ({ ...prev, mentor_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Enter display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_category_id">Primary Category ID</Label>
            <Input
              id="primary_category_id"
              value={formData.primary_category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, primary_category_id: e.target.value }))}
              placeholder="Enter life category UUID (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Enter mentor bio (optional)"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              min="0"
              value={formData.hourly_rate || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                hourly_rate: e.target.value ? parseFloat(e.target.value) : 0 
              }))}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_public: !!checked }))
              }
            />
            <Label htmlFor="is_public">Public Profile</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <div>
          {!isNew && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Mentor</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this mentor? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBack}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!formData.user_id || upsertMentor.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {upsertMentor.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminMentorEditPage;