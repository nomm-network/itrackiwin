import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { normalizeMentor, MentorModel } from "./schema";
import { useAdminUsers } from "./hooks/useAdminUsers";
import { useGyms } from "./hooks/useGyms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

type Props = { 
  mode: "create" | "edit"; 
  initial?: Partial<MentorModel>;
};

type LifeCategory = {
  id: string;
  name: string;
};

export function MentorForm({ mode, initial = {} }: Props) {
  // Form state
  const [userId, setUserId] = useState(initial.userId ?? "");
  const [mentorType, setMentorType] = useState(initial.type ?? "mentor");
  const [primaryCategoryId, setPrimaryCategoryId] = useState(initial.primaryCategoryId ?? "");
  const [isActive, setIsActive] = useState(initial.isActive ?? true);
  const [bio, setBio] = useState(initial.bio ?? "");
  const [hourlyRate, setHourlyRate] = useState<string>(initial.hourlyRate?.toString() ?? "");
  const [gymId, setGymId] = useState<string>("none");

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<LifeCategory[]>([]);

  // Load users, gyms and categories
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: gyms, isLoading: gymsLoading } = useGyms();

  const navigate = useNavigate();
  const { id } = useParams();

  // Load categories safely
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('life_categories')
          .select('id, name')
          .order('name');
        
        if (error) {
          console.warn('Failed to load categories:', error.message);
          setCategories([]);
        } else {
          setCategories(data || []);
        }
      } catch (e: any) {
        console.warn('Categories load error:', e.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  // Load mentor data for edit mode
  useEffect(() => {
    if (mode === "edit" && id) {
      async function loadMentor() {
        try {
          setLoading(true);
          setError(null);
          console.log('🔍 Loading mentor for edit:', id);
          
          const { data, error } = await supabase
            .from('v_admin_mentors_overview')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            console.error('❌ Error loading mentor:', error);
            throw new Error(error.message);
          }
          if (!data) {
            throw new Error('Mentor not found');
          }
          
          console.log('✅ Mentor data loaded:', data);
          
          // Set form fields with loaded data
          setUserId(data.user_id);
          setMentorType(data.mentor_type || "mentor");
          setPrimaryCategoryId(data.primary_category_id || "");
          setIsActive(data.is_active ?? true);
          setBio(data.bio || "");
          setHourlyRate(data.hourly_rate?.toString() || "");
          setGymId(data.gym_id || "none");
          
        } catch (e: any) {
          console.error('❌ Failed to load mentor:', e);
          setError(e.message);
        } finally {
          setLoading(false);
        }
      }
      loadMentor();
    }
  }, [mode, id]);

  async function onSave() {
    setError(null);
    setSaving(true);
    
    try {
      if (!userId.trim()) {
        throw new Error('User ID is required');
      }

      const payload = {
        id: mode === "edit" ? id : undefined,
        user_id: userId.trim(),
        mentor_type: mentorType, // This will be cast to the enum type in the RPC
        primary_category_id: primaryCategoryId || null,
        is_active: isActive,
        bio: bio.trim() || null,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        gym_id: gymId === "none" ? null : gymId
      };

      const { data, error } = await supabase.rpc('admin_upsert_mentor_fixed', {
        p_payload: payload
      });

      if (error) throw new Error(error.message);
      
      toast({ title: `Mentor ${mode === "create" ? "created" : "updated"} successfully` });
      
      // Navigate back to mentors list after successful save
      navigate('/admin/mentors');
    } catch (e: any) {
      setError(e.message);
      toast({ 
        title: 'Failed to save mentor', 
        description: e.message, 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!id || mode !== "edit") return;
    
    if (!confirm('Are you sure you want to delete this mentor?')) return;
    
    try {
      setSaving(true);
      const { error } = await supabase.rpc('admin_delete_mentor', { p_id: id });
      if (error) throw new Error(error.message);
      
      toast({ title: 'Mentor deleted successfully' });
      navigate('/admin/mentors');
    } catch (e: any) {
      setError(e.message);
      toast({ 
        title: 'Failed to delete mentor', 
        description: e.message, 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading || usersLoading || gymsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/admin/mentors')}>
            ← Back to Mentors
          </Button>
          <div className="flex gap-2">
            {mode === "edit" && (
              <Button variant="destructive" onClick={onDelete} disabled={saving}>
                Delete
              </Button>
            )}
            <Button onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : mode === "create" ? 'Create Mentor' : 'Update Mentor'}
            </Button>
          </div>
        </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="text-red-800 font-medium">Error</div>
          <div className="text-red-700 text-sm mt-1">{error}</div>
        </div>
      )}

      {/* Form */}
      <div className="grid gap-4 max-w-lg">
        <div>
          <Label htmlFor="userId">User *</Label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-50">
              {users?.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id} className="bg-background hover:bg-muted">
                  <div className="flex flex-col">
                    <span className="font-medium">{user.email}</span>
                    <span className="text-xs text-muted-foreground">ID: {user.user_id.substring(0, 8)}...</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!users?.length && (
            <p className="text-xs text-muted-foreground">
              No users found. Make sure users exist in the system.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="mentorType">Mentor Type</Label>
          <Select value={mentorType} onValueChange={setMentorType}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select mentor type" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-50">
              <SelectItem value="mentor" className="bg-background hover:bg-muted">Mentor</SelectItem>
              <SelectItem value="coach" className="bg-background hover:bg-muted">Coach</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="primaryCategory">Primary Category</Label>
          <Select value={primaryCategoryId} onValueChange={setPrimaryCategoryId}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select primary category" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-50">
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="bg-background hover:bg-muted">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="gym">Gym (Optional)</Label>
          <Select value={gymId} onValueChange={setGymId}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select a gym (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-50">
              <SelectItem value="none" className="bg-background hover:bg-muted">
                <span className="text-muted-foreground">No gym selected</span>
              </SelectItem>
              {gyms?.map((gym) => (
                <SelectItem key={gym.id} value={gym.id} className="bg-background hover:bg-muted">
                  <div className="flex flex-col">
                    <span className="font-medium">{gym.name}</span>
                    {gym.address && (
                      <span className="text-xs text-muted-foreground">{gym.address}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!gyms?.length && (
            <p className="text-xs text-muted-foreground">
              No gyms found in the system.
            </p>
          )}
        </div>


        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(checked as boolean)}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Enter bio..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="hourlyRate">Hourly Rate</Label>
          <Input
            id="hourlyRate"
            type="number"
            step="0.01"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Safe debug info */}
      <div className="mt-8 p-4 bg-green-100 border border-green-200 rounded">
        <h3 className="font-bold text-lg mb-2 text-green-800">🐛 Debug Info</h3>
        <div className="space-y-1 text-sm text-green-700">
          <p><strong>Route ID:</strong> {id || 'new'}</p>
          <p><strong>Mode:</strong> {mode}</p>
          <p><strong>Is Edit Mode:</strong> {mode === "edit" ? 'Yes' : 'No'}</p>
          <p><strong>Categories loaded:</strong> {categories.length}</p>
          <p><strong>Gyms loaded:</strong> {gyms?.length || 0}</p>
          <p><strong>Current URL:</strong> {window.location.href}</p>
          <p><strong>Form State:</strong> userId="{userId}", type="{mentorType}", active={isActive.toString()}, gym="{gymId}"</p>
        </div>
      </div>
    </div>
  );
}

