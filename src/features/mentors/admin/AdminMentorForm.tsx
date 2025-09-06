import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type MentorType = 'mentor' | 'coach';

type LifeCategory = { 
  id: string; 
  slug?: string | null; 
  name?: string | null; 
};

export default function AdminMentorForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  
  // Form state
  const [userId, setUserId] = useState<string>('');
  const [mentorType, setMentorType] = useState<MentorType>('mentor');
  const [primaryCategoryId, setPrimaryCategoryId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [bio, setBio] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<string>('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<LifeCategory[]>([]);

  const title = isNew ? 'New Mentor' : 'Edit Mentor';

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('life_categories')
          .select('id, slug, name')
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Failed to load categories:', error);
          setError('Failed to load categories');
        } else {
          setCategories(data || []);
        }
      } catch (e) {
        console.error('Error loading categories:', e);
        setError('Error loading categories');
      }
    };

    loadCategories();
  }, []);

  const onSave = async () => {
    setError(null);
    setSaving(true);
    
    try {
      // Basic validation
      if (!userId.trim()) {
        setError('User ID is required.');
        return;
      }

      if (!mentorType) {
        setError('Mentor type is required.');
        return;
      }

      const payload = {
        id: isNew ? null : id,
        user_id: userId.trim(),
        mentor_type: mentorType,
        primary_category_id: primaryCategoryId || null,
        is_active: isActive,
        bio: bio.trim() || null,
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      };

      console.log('Saving mentor:', payload);

      const { data, error } = await supabase.rpc('admin_upsert_mentor', {
        p_payload: payload
      });

      if (error) {
        console.error('Save error:', error);
        setError(error.message);
        return;
      }

      console.log('Mentor saved successfully:', data);
      
      // Navigate to the mentor details or back to list
      if (isNew && data) {
        navigate(`/admin/mentors/${data}`);
      } else {
        navigate('/admin/mentors');
      }
      
    } catch (e: any) {
      console.error('Unexpected error:', e);
      setError(e?.message || 'Failed to save mentor.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (isNew) return navigate('/admin/mentors');
    if (!id) return;

    if (!confirm('Delete this mentor profile? This cannot be undone.')) return;

    setError(null);
    try {
      const { error } = await supabase.rpc('admin_delete_mentor', {
        p_id: id
      });

      if (error) {
        setError(error.message);
        return;
      }

      navigate('/admin/mentors');
    } catch (e: any) {
      setError(e?.message || 'Failed to delete mentor.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/admin/mentors')}
            variant="outline"
          >
            Back
          </Button>
          {!isNew && (
            <Button
              onClick={onDelete}
              variant="destructive"
            >
              Delete
            </Button>
          )}
          <Button
            onClick={onSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* User ID */}
        <div className="space-y-2">
          <Label htmlFor="userId">User ID</Label>
          <Input
            id="userId"
            placeholder="User UUID (paste from Users list)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Paste the User ID from the Users management page.
          </p>
        </div>

        {/* Mentor Type */}
        <div className="space-y-2">
          <Label htmlFor="mentorType">Type</Label>
          <Select value={mentorType} onValueChange={(value) => setMentorType(value as MentorType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mentor">Mentor</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Primary Category */}
        <div className="space-y-2">
          <Label htmlFor="primaryCategory">Primary Category</Label>
          <Select value={primaryCategoryId} onValueChange={setPrimaryCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select category (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">— None —</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name || c.slug || c.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(!!checked)}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio (optional)</Label>
          <Textarea
            id="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short bio or description..."
          />
        </div>

        {/* Hourly Rate */}
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Hourly Rate (optional)</Label>
          <Input
            id="hourlyRate"
            type="number"
            step="0.01"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="e.g. 49.99"
          />
        </div>

        {/* Debug info */}
        <div className="mt-8 p-4 bg-muted border border-border rounded">
          <h3 className="font-bold text-lg mb-2 text-foreground">🐛 Debug Info</h3>
          <div className="space-y-1 text-sm text-foreground">
            <p>Route ID: {id}</p>
            <p>Is New: {isNew ? 'true' : 'false'}</p>
            <p>Categories loaded: {categories.length}</p>
            <p>Current URL: {window.location.href}</p>
          </div>
        </div>
      </div>
    </div>
  );
}