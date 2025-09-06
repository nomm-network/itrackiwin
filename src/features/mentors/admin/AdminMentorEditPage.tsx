import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUpsertMentor } from './hooks/useUpsertMentor';
import { useDeleteMentor } from './hooks/useDeleteMentor';
import PageNav from '@/components/PageNav';
import AdminMenu from '@/admin/components/AdminMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

type MentorType = 'mentor' | 'coach';

type ViewRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  mentor_type: MentorType | null;
  primary_category_id: string | null;
  is_active: boolean | null;
  created_at: string;
  bio?: string | null;
  hourly_rate?: number | null;
};

type LifeCategory = { id: string; slug?: string | null; name?: string | null };

export default function AdminMentorEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  
  // Debug logging
  console.log('🐛 AdminMentorEditPage - id:', id, 'isNew:', isNew);

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<ViewRow | null>(null);
  const [categories, setCategories] = useState<LifeCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [userId, setUserId] = useState<string>('');
  const [mentorType, setMentorType] = useState<MentorType>('mentor');
  const [primaryCategoryId, setPrimaryCategoryId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [bio, setBio] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<string>('');

  const { mutateAsync: upsertMentor, isPending: saving } = useUpsertMentor();
  const { mutateAsync: deleteMentor, isPending: deleting } = useDeleteMentor();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      console.log('🐛 AdminMentorEditPage - Loading started, isNew:', isNew, 'id:', id);
      setLoading(true);
      setError(null);

      // load categories
      console.log('🐛 AdminMentorEditPage - Loading categories...');
      const { data: cats, error: catErr } = await supabase
        .from('life_categories')
        .select('id, slug, name')
        .order('name', { ascending: true });

      if (!cancelled) {
        if (catErr) {
          console.error('🐛 AdminMentorEditPage - Categories error:', catErr);
          setError(catErr.message);
        } else {
          console.log('🐛 AdminMentorEditPage - Categories loaded:', cats?.length);
          setCategories(cats || []);
        }
      }

      if (!isNew) {
        const { data, error: vErr } = await supabase
          .from('v_admin_mentors_overview')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!cancelled) {
          if (vErr) setError(vErr.message);
          setRow(data || null);
          if (data) {
            setUserId(data.user_id || '');
            setMentorType((data.mentor_type as MentorType) || 'mentor');
            setPrimaryCategoryId(data.primary_category_id || '');
            setIsActive(Boolean(data.is_active));
            setBio(data.bio || '');
            setHourlyRate(data.hourly_rate?.toString() || '');
          }
        }
      }

      if (isNew) {
        console.log('🐛 AdminMentorEditPage - Setting up new mentor defaults');
        // defaults for create
        setRow(null);
        setUserId('');
        setMentorType('mentor');
        setPrimaryCategoryId('');
        setIsActive(true);
        setBio('');
        setHourlyRate('');
      }

      if (!cancelled) setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  const title = useMemo(
    () =>
      isNew
        ? 'New Mentor'
        : row?.display_name
          ? `Edit: ${row.display_name}`
          : 'Edit Mentor',
    [isNew, row?.display_name]
  );

  const onSave = async () => {
    setError(null);
    // minimal validation
    if (!userId) return setError('User ID is required.');
    if (!mentorType) return setError('Mentor type is required.');

    const payload = {
      id: isNew ? null : id,
      user_id: userId,
      mentor_type: mentorType,
      primary_category_id: primaryCategoryId || null,
      is_active: isActive,
      bio: bio || null,
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
    };

    try {
      const newId = await upsertMentor(payload);
      navigate(`/admin/mentors/${newId}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to save mentor.');
    }
  };

  const onDelete = async () => {
    if (isNew) return navigate('/admin/mentors');
    if (!id) return;

    if (!confirm('Delete this mentor profile? This cannot be undone.')) return;

    setError(null);
    try {
      await deleteMentor(id);
      navigate('/admin/mentors');
    } catch (e: any) {
      setError(e?.message || 'Failed to delete mentor.');
    }
  };

  return (
    <main className="container py-12">
      <PageNav current={`Admin / Mentors / ${title}`} />
      <AdminMenu />
      
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
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
                disabled={deleting}
                variant="destructive"
              >
                {deleting ? 'Deleting…' : 'Delete'}
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

        {loading ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">Loading… (isNew: {isNew ? 'true' : 'false'})</p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* User ID */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              {isNew ? (
                <Input
                  id="userId"
                  placeholder="User UUID (paste from Users list)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              ) : (
                <div className="p-3 rounded border bg-gray-50">
                  <div className="text-sm">
                    <span className="font-medium">{row?.display_name || '—'}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{row?.email || '—'}</div>
                  <div className="text-xs text-muted-foreground mt-1">User ID: {row?.user_id}</div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                For now, paste the User ID from the Users management page.
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
          </div>
        )}
      </div>
    </main>
  );
}