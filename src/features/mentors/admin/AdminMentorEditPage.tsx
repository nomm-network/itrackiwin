import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUpsertMentor } from './hooks/useUpsertMentor';
import { useDeleteMentor } from './hooks/useDeleteMentor';

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
  bio?: string | null;            // if present in your view; safe as optional
  hourly_rate?: number | null;    // "
};

type LifeCategory = { id: string; slug?: string | null; name?: string | null };

export default function AdminMentorEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();

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
  const [hourlyRate, setHourlyRate] = useState<string>(''); // keep string for input

  const { mutateAsync: upsertMentor, isPending: saving } = useUpsertMentor();
  const { mutateAsync: deleteMentor, isPending: deleting } = useDeleteMentor();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      // load categories
      const { data: cats, error: catErr } = await supabase
        .from('life_categories')
        .select('id, slug, name')
        .order('name', { ascending: true });

      if (!cancelled) {
        if (catErr) setError(catErr.message);
        else setCategories(cats || []);
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
          }
        }
      }

      if (isNew) {
        // defaults for create
        setRow(null);
        setUserId('');
        setMentorType('mentor');
        setPrimaryCategoryId('');
        setIsActive(true);
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
    // primary_category_id optional, depends on your logic

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
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/mentors')}
            className="px-3 py-2 rounded border"
          >
            Back
          </button>
          {!isNew && (
            <button
              onClick={onDelete}
              disabled={deleting}
              className="px-3 py-2 rounded border border-red-600 text-red-600"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            className="px-3 py-2 rounded bg-emerald-600 text-white"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm opacity-70">Loading…</div>
      ) : (
        <>
          {error && (
            <div className="mb-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* User (readonly when editing, free input when creating) */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">User</label>
            {isNew ? (
              <input
                className="w-full rounded border p-2"
                placeholder="User UUID (paste)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            ) : (
              <div className="p-2 rounded border bg-gray-50">
                <div className="text-sm">
                  <span className="font-medium">{row?.display_name || '—'}</span>
                </div>
                <div className="text-xs opacity-70">{row?.email || '—'}</div>
                <div className="text-[11px] opacity-50 mt-1">User ID: {row?.user_id}</div>
              </div>
            )}
            <p className="text-xs opacity-60 mt-1">
              For a nicer UX later we can add a user picker; UUID is safest for now.
            </p>
          </div>

          {/* Mentor type */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="w-full rounded border p-2"
              value={mentorType}
              onChange={(e) => setMentorType(e.target.value as MentorType)}
            >
              <option value="mentor">Mentor</option>
              <option value="coach">Coach</option>
            </select>
          </div>

          {/* Primary category */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Primary Category</label>
            <select
              className="w-full rounded border p-2"
              value={primaryCategoryId}
              onChange={(e) => setPrimaryCategoryId(e.target.value)}
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.slug || c.id}
                </option>
              ))}
            </select>
          </div>

          {/* Active */}
          <div className="mb-4 flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              className="h-4 w-4"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="is_active" className="text-sm">Active</label>
          </div>

          {/* Bio */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Bio (optional)</label>
            <textarea
              className="w-full rounded border p-2"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio…"
            />
          </div>

          {/* Hourly rate */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Hourly Rate (optional)</label>
            <input
              className="w-full rounded border p-2"
              type="number"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="e.g. 49.99"
            />
          </div>
        </>
      )}
    </div>
  );
}