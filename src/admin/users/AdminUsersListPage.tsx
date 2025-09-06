import React from 'react';
import { Link } from 'react-router-dom';
import PageNav from '@/components/PageNav';
import AdminMenu from '../components/AdminMenu';
import { useAdminUsers } from './hooks/useAdminUsers';
import { Button } from '@/components/ui/button';

export default function AdminUsersListPage() {
  const { data: users, isLoading, error, status, fetchStatus } = useAdminUsers();

  return (
    <main className="container py-12">
      <PageNav current="Admin / Users" />
      <AdminMenu />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

        {isLoading && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">Loading users...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800 mb-2">Error Loading Users</h3>
            <p className="text-red-700">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}

        {!isLoading && !error && users && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Created</th>
                  <th className="text-left p-4 font-medium">Assignments</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user: any) => (
                  <tr key={user.user_id} className="border-t hover:bg-muted/50">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {user.assignments?.map((assignment: any, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                          >
                            {assignment.mentor_type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/users/${user.user_id}`}>
                          Manage
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users?.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        )}

        {/* DEBUG AREA */}
        <div className="mt-8 p-4 bg-gray-100 border rounded">
          <h3 className="font-bold text-lg mb-3 text-black">🐛 Debug Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-black">
            <div>
              <h4 className="font-semibold mb-2 text-black">Query Status</h4>
              <ul className="space-y-1">
                <li><strong>Status:</strong> {status}</li>
                <li><strong>Fetch Status:</strong> {fetchStatus}</li>
                <li><strong>Is Loading:</strong> {isLoading.toString()}</li>
                <li><strong>Has Error:</strong> {!!error ? "Yes" : "No"}</li>
                <li><strong>Has Data:</strong> {!!users ? "Yes" : "No"}</li>
                <li><strong>Users Count:</strong> {users?.length ?? "null"}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-black">Error Details</h4>
              {error ? (
                <div className="bg-red-50 p-2 rounded text-xs text-black">
                  <pre className="whitespace-pre-wrap text-black">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-black">No errors</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-black">Raw Data Sample</h4>
              {users ? (
                <div className="bg-green-50 p-2 rounded text-xs max-h-32 overflow-y-auto text-black">
                  <pre className="whitespace-pre-wrap text-black">
                    {JSON.stringify(users?.slice(0, 2), null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-black">No data</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-black">Environment Info</h4>
              <ul className="space-y-1">
                <li><strong>URL:</strong> {window.location.href}</li>
                <li><strong>Timestamp:</strong> {new Date().toISOString()}</li>
                <li><strong>User Agent:</strong> {navigator.userAgent.slice(0, 50)}...</li>
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2 text-black">Console Logs</h4>
            <p className="text-xs text-black">
              Check the browser console (F12) for detailed logs from useAdminUsers hook.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}