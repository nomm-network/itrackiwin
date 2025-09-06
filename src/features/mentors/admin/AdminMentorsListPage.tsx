import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMentors } from './hooks/useMentors';

const AdminMentorsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: mentors, isLoading, error, refetch } = useMentors();

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mentors / Coaches</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="px-3 py-2 rounded-md border hover:bg-muted"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate('/app/admin/mentors/new')}
            className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          >
            New Mentor
          </button>
        </div>
      </div>

      {isLoading && <div className="text-sm opacity-70">Loading…</div>}
      {error && (
        <div className="text-sm text-red-500">
          {String(error)}
        </div>
      )}

      {!isLoading && !error && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Primary Category</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {(mentors ?? []).map((m) => (
                <tr
                  key={m.id}
                  onClick={() => navigate(`/app/admin/mentors/${m.id}`)}
                  className="hover:bg-muted/30 cursor-pointer"
                >
                  <td className="px-3 py-2">{m.display_name ?? '—'}</td>
                  <td className="px-3 py-2">{m.email ?? '—'}</td>
                  <td className="px-3 py-2 capitalize">{m.mentor_type ?? '—'}</td>
                  <td className="px-3 py-2">{(m as any).primary_category_name ?? '—'}</td>
                  <td className="px-3 py-2">
                    {m.is_active ? (
                      <span className="rounded bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 text-xs">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">{m.created_at?.slice(0, 10) ?? '—'}</td>
                </tr>
              ))}

              {(!mentors || mentors.length === 0) && (
                <tr>
                  <td className="px-3 py-6 text-center opacity-60" colSpan={6}>
                    No mentors yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminMentorsListPage;