import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMentors } from './hooks/useMentors';
import { cn } from '@/lib/utils';

export default function AdminMentorsListPage() {
  const nav = useNavigate();
  const { data, isLoading, error } = useMentors();

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Mentors / Coaches</h1>
        <button
          onClick={() => nav('/app/admin/mentors/new')}
          className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
        >
          New Mentor
        </button>
      </div>

      {isLoading && <div className="text-sm opacity-70">Loading…</div>}
      {error && <div className="text-sm text-red-500">{(error as any)?.message}</div>}

      <div className="overflow-auto rounded-md border border-zinc-800">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-zinc-900/50">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Primary Category</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((r) => (
              <tr
                key={r.id}
                onClick={() => nav(`/app/admin/mentors/${r.id}`)}
                className={cn(
                  'cursor-pointer hover:bg-emerald-500/5 border-t border-zinc-800'
                )}
              >
                <td className="px-3 py-2">{r.display_name || r.user_id}</td>
                <td className="px-3 py-2">{r.email || '-'}</td>
                <td className="px-3 py-2 text-center">{r.mentor_type}</td>
                <td className="px-3 py-2 text-center">{r.primary_category_id || '-'}</td>
                <td className="px-3 py-2 text-center">
                  {r.is_active ? 'Yes' : 'No'}
                </td>
                <td className="px-3 py-2 text-center">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center opacity-70">
                  No mentors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* tiny debug row */}
      <div className="mt-3 text-xs opacity-60">
        Source: <code>v_admin_mentors_overview</code>
      </div>
    </div>
  );
}