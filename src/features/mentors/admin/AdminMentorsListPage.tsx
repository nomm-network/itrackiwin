import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMentors } from './hooks/useMentors';
import PageNav from '@/components/PageNav';
import AdminMenu from '@/admin/components/AdminMenu';

const AdminMentorsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: mentors, isLoading, error, refetch } = useMentors();

  return (
    <main className="container py-12">
      <PageNav current="Admin / Mentors" />
      <AdminMenu />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mentors / Coaches</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="px-3 py-2 rounded-md border hover:bg-muted"
            >
              Refresh
            </button>
            <button
              onClick={() => navigate('/admin/mentors/new')}
              className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
            >
              New Mentor
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">Loading mentors...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800 mb-2">Error Loading Mentors</h3>
            <p className="text-red-700">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}

        {!isLoading && !error && mentors && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Primary Category</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {mentors?.map((m: any) => (
                  <tr 
                    key={m.id} 
                    className="border-t hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/admin/mentors/${m.id}`)}
                  >
                    <td className="p-4 font-medium">{m.display_name || 'Unknown'}</td>
                    <td className="p-4 text-muted-foreground">{m.email || '—'}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {m.mentor_type}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{m.primary_category_id || '—'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        m.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {m.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {mentors?.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No mentors yet.
              </div>
            )}
          </div>
        )}

        {/* DEBUG AREA for Mentors */}
        <div className="mt-8 p-4 bg-gray-100 border rounded">
          <h3 className="font-bold text-lg mb-3">🐛 Mentors Debug Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Query Status</h4>
              <ul className="space-y-1">
                <li><strong>Is Loading:</strong> {isLoading.toString()}</li>
                <li><strong>Has Error:</strong> {!!error ? "Yes" : "No"}</li>
                <li><strong>Has Data:</strong> {!!mentors ? "Yes" : "No"}</li>
                <li><strong>Mentors Count:</strong> {mentors?.length ?? "null"}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Error Details</h4>
              {error ? (
                <div className="bg-red-50 p-2 rounded text-xs">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500">No errors</p>
              )}
            </div>

            <div className="md:col-span-2">
              <h4 className="font-semibold mb-2">Raw Data Sample</h4>
              {mentors ? (
                <div className="bg-green-50 p-2 rounded text-xs max-h-32 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(mentors?.slice(0, 2), null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500">No data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminMentorsListPage;