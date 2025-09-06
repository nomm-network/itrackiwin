import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMentor } from './hooks/useMentors';
import { useUpsertMentor } from './hooks/useUpsertMentor';
import { useDeleteMentor } from './hooks/useDeleteMentor';
import { supabase } from '@/integrations/supabase/client';

type Category = { id: string; name: string };

const AdminMentorEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id = 'new' } = useParams();
  const isNew = id === 'new';

  // readonly view row (for existing mentor)
  const { data: mentor, isLoading, error } = useMentor(isNew ? undefined : id);

  // minimal local form state
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [mentorType, setMentorType] = useState<'mentor' | 'coach' | ''>('');
  const [primaryCategoryId, setPrimaryCategoryId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [bio, setBio] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  // hooks for mutations
  const upsertMentor = useUpsertMentor();
  const deleteMentor = useDeleteMentor();

  // Load categories (read-only)
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      const { data, error } = await supabase
        .from('life_categories')
        .select('id, name')
        .order('name', { ascending: true });
      if (!ignore) {
        if (error) setLoadErr(error.message);
        else setCategories((data || []) as Category[]);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // hydrate form for existing mentor
  useEffect(() => {
    if (!mentor || isNew) return;
    setUserId(mentor.user_id ?? '');
    setUserEmail(mentor.email ?? '');
    setDisplayName(mentor.display_name ?? '');
    setMentorType((mentor.mentor_type as any) ?? '');
    setPrimaryCategoryId(mentor.primary_category_id ?? '');
    setIsActive(!!mentor.is_active);
    // optional fields if your view exposes them:
    // setBio(mentor.bio ?? '');
    // setHourlyRate(mentor.hourly_rate ?? '');
  }, [mentor, isNew]);

  const canSave = useMemo(() => {
    // For new mentor we need user_id & mentor_type at minimum
    if (isNew) return userId && mentorType;
    return true;
  }, [isNew, userId, mentorType]);

  const onSave = async () => {
    try {
      setSaving(true);
      const payload = {
        id: isNew ? undefined : id,
        user_id: userId || undefined,
        mentor_type: mentorType || undefined,
        primary_category_id: primaryCategoryId || null,
        is_active: isActive,
        bio: bio || null,
        hourly_rate: hourlyRate === '' ? null : Number(hourlyRate),
      } as any;
      const res = await upsertMentor.mutateAsync(payload);
      const newId = (res as any)?.[0]?.id || id;
      navigate(`/app/admin/mentors/${newId}`);
    } catch (e: any) {
      alert(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (isNew) {
      navigate('/app/admin/mentors');
      return;
    }
    if (!confirm('Delete this mentor profile?')) return;
    try {
      await deleteMentor.mutateAsync(id as string);
      navigate('/app/admin/mentors');
    } catch (e: any) {
      alert(e?.message || 'Delete failed');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {isNew ? 'New Mentor / Coach' : 'Edit Mentor / Coach'}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/app/admin/mentors')}
            className="px-3 py-2 rounded-md border hover:bg-muted"
          >
            Back
          </button>
          {!isNew && (
            <button
              onClick={onDelete}
              className="px-3 py-2 rounded-md border border-red-500 text-red-600 hover:bg-red-600 hover:text-white"
            >
              Delete
            </button>
          )}
          <button
            onClick={onSave}
            disabled={!canSave || saving}
            className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {(isLoading || upsertMentor.isPending) && (
        <div className="text-sm opacity-70">Loading…</div>
      )}
      {error && <div className="text-sm text-red-500">{String(error)}</div>}
      {loadErr && <div className="text-sm text-red-500">{loadErr}</div>}

      {/* User (readonly for existing, manual for new) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-md">
        <div>
          <label className="text-xs uppercase opacity-70">User ID</label>
          <input
            className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder={isNew ? 'UUID of the user' : ''}
            readOnly={!isNew}
          />
          <p className="text-xs opacity-60 mt-1">
            {isNew
              ? 'Paste the user UUID. (We can add a user picker later.)'
              : 'Readonly for existing mentor.'}
          </p>
        </div>
        <div>
          <label className="text-xs uppercase opacity-70">User Email</label>
          <input
            className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="(auto from view if existing)"
            readOnly
          />
          <p className="text-xs opacity-60 mt-1">
            Populated from the admin view (readonly).
          </p>
        </div>

        <div>
          <label className="text-xs uppercase opacity-70">Display Name</label>
          <input
            className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="(auto from view if existing)"
            readOnly
          />
        </div>

        <div>
          <label className="text-xs uppercase opacity-70">Type</label>
          <select
            className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
            value={mentorType}
            onChange={(e) => setMentorType(e.target.value as any)}
          >
            <option value="">— select —</option>
            <option value="mentor">Mentor</option>
            <option value="coach">Coach</option>
          </select>
        </div>

        <div>
          <label className="text-xs uppercase opacity-70">Primary Category</label>
          <select
            className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
            value={primaryCategoryId}
            onChange={(e) => setPrimaryCategoryId(e.target.value)}
          >
            <option value="">— none —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-xs opacity-60 mt-1">
            Optional. Categories read directly from <code>life_categories</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="is_active"
            type="checkbox"
            className="h-4 w-4"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="is_active">Active</label>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs uppercase opacity-70">Bio (optional)</label>
          <textarea
            className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short bio, credentials, coaching style…"
          />
        </div>

        <div>
          <label className="text-xs uppercase opacity-70">Hourly Rate (optional)</label>
          <input
            type="number"
            className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g., 50"
            min={0}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminMentorEditPage;