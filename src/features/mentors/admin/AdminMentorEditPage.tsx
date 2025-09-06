import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMentor } from './hooks/useMentors';
import { useUpsertMentor } from './hooks/useUpsertMentor';
import { useDeleteMentor } from './hooks/useDeleteMentor';
import { toast } from 'sonner';

export default function AdminMentorEditPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const { data } = useMentor(!isNew ? id : undefined);
  const upsert = useUpsertMentor();
  const del = useDeleteMentor();

  const [form, setForm] = React.useState({
    id: isNew ? undefined : id,
    user_id: data?.user_id ?? '',
    mentor_type: (data?.mentor_type as 'mentor' | 'coach') ?? 'mentor',
    primary_category_id: data?.primary_category_id ?? '',
    is_active: data?.is_active ?? true,
    bio: '' as string | null,
    hourly_rate: undefined as number | undefined
  });

  React.useEffect(() => {
    if (!data) return;
    setForm((f) => ({
      ...f,
      id: data.id,
      user_id: data.user_id,
      mentor_type: data.mentor_type,
      primary_category_id: data.primary_category_id ?? '',
      is_active: data.is_active
    }));
  }, [data]);

  const onSave = async () => {
    if (!form.user_id) {
      toast.error('Select a user_id (temporary requirement).');
      return;
    }
    await upsert.mutateAsync({
      ...form,
      primary_category_id: form.primary_category_id || null,
      bio: form.bio || null,
      hourly_rate: form.hourly_rate ?? null
    });
    nav('/app/admin/mentors');
  };

  const onDelete = async () => {
    if (!id || isNew) return;
    await del.mutateAsync(id);
    nav('/app/admin/mentors');
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">
          {isNew ? 'New Mentor' : 'Edit Mentor'}
        </h1>
        <div className="flex gap-2">
          {!isNew && (
            <button
              onClick={onDelete}
              className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => nav('/app/admin/mentors')}
            className="px-3 py-2 rounded-md border border-zinc-700 hover:bg-zinc-900"
          >
            Back
          </button>
          <button
            onClick={onSave}
            className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Save
          </button>
        </div>
      </div>

      {/* Minimal form; replace user_id with a proper user picker later */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">User ID</label>
          <input
            value={form.user_id}
            onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
            className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800"
            placeholder="uuid-of-user"
          />
          <p className="text-xs opacity-60 mt-1">
            (Temporary) paste a user UUID; we'll add a proper picker later.
          </p>
        </div>

        <div>
          <label className="block text-sm mb-1">Type</label>
          <select
            value={form.mentor_type}
            onChange={(e) =>
              setForm((f) => ({ ...f, mentor_type: e.target.value as 'mentor' | 'coach' }))
            }
            className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800"
          >
            <option value="mentor">mentor</option>
            <option value="coach">coach</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Primary Category ID</label>
          <input
            value={form.primary_category_id ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, primary_category_id: e.target.value }))}
            className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800"
            placeholder="uuid-of-life-category (optional)"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
          />
          <label htmlFor="is_active" className="text-sm">Active</label>
        </div>

        <div>
          <label className="block text-sm mb-1">Bio (optional)</label>
          <textarea
            value={form.bio ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 min-h-[80px]"
            placeholder="Short bio…"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Hourly Rate (optional)</label>
          <input
            type="number"
            value={form.hourly_rate ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, hourly_rate: e.target.value ? Number(e.target.value) : undefined }))
            }
            className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800"
            placeholder="e.g., 50"
          />
        </div>
      </div>

      <div className="mt-4 text-xs opacity-60">
        Uses RPC: <code>admin_upsert_mentor</code>, <code>admin_delete_mentor</code> · View: <code>v_admin_mentors_overview</code>
      </div>
    </div>
  );
}