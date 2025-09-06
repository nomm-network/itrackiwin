import React from 'react';
import { Link } from 'react-router-dom';
import PageNav from '@/components/PageNav';
import AdminMenu from '../components/AdminMenu';
import { useAdminUsers } from './hooks/useAdminUsers';
import { Button } from '@/components/ui/button';

export default function AdminUsersListPage() {
  const { data: users, isLoading, error } = useAdminUsers();

  if (isLoading) {
    return (
      <main className="container py-12">
        <PageNav current="Admin / Users" />
        <AdminMenu />
        <p className="text-muted-foreground">Loading users...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-12">
        <PageNav current="Admin / Users" />
        <AdminMenu />
        <div className="text-red-600">
          Error loading users: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </main>
    );
  }

  return (
    <main className="container py-12">
      <PageNav current="Admin / Users" />
      <AdminMenu />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

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
      </div>
    </main>
  );
}