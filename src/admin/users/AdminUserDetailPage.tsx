import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageNav from '@/components/PageNav';
import AdminMenu from '../components/AdminMenu';
import { useAdminUser } from './hooks/useAdminUser';
import { useCategories } from './hooks/useCategories';
import { useSetCoach } from './hooks/useSetCoach';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminUserDetailPage() {
  const { id: userId } = useParams<{ id: string }>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  const { data: user, isLoading: userLoading, error: userError } = useAdminUser(userId);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { mutateAsync: setCoach, isPending: settingCoach } = useSetCoach();

  const handleToggleCoach = async (categoryId: string, isCurrentlyCoach: boolean) => {
    if (!userId) return;
    
    try {
      await setCoach({
        userId,
        lifeCategoryId: categoryId,
        isCoach: !isCurrentlyCoach
      });
    } catch (error) {
      console.error('Error setting coach status:', error);
    }
  };

  const handleAddCoachAssignment = async () => {
    if (!userId || !selectedCategoryId) return;
    
    try {
      await setCoach({
        userId,
        lifeCategoryId: selectedCategoryId,
        isCoach: true
      });
      setSelectedCategoryId('');
    } catch (error) {
      console.error('Error adding coach assignment:', error);
    }
  };

  if (userLoading || categoriesLoading) {
    return (
      <main className="container py-12">
        <PageNav current="Admin / Users / User Detail" />
        <AdminMenu />
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (userError || !user) {
    return (
      <main className="container py-12">
        <PageNav current="Admin / Users / User Detail" />
        <AdminMenu />
        <div className="text-red-600">
          Error loading user: {userError instanceof Error ? userError.message : 'User not found'}
        </div>
      </main>
    );
  }

  // Since the user data doesn't have assignments anymore, we'll work with roles
  const userRoles = user.roles || [];
  const isCoach = userRoles.includes('coach');
  
  // Get available categories for assignment
  const availableCategories = categories || [];

  return (
    <main className="container py-12">
      <PageNav current="Admin / Users / User Detail" />
      <AdminMenu />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{user.email}</h1>
            <p className="text-muted-foreground">Email: {user.email}</p>
            <p className="text-sm text-muted-foreground">
              User ID: {user.user_id}
            </p>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(user.created_at).toLocaleDateString()}
            </p>
            <div className="flex gap-2 mt-2">
              {user.roles?.map((role: string) => (
                <Badge key={role} variant="secondary">{role}</Badge>
              ))}
              {user.is_pro && <Badge variant="default">Pro User</Badge>}
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/users">Back to Users</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coach Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current role information */}
            <div className="space-y-2">
              <h4 className="font-medium">User Information</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Roles:</span>
                    <div className="flex gap-1">
                      {user.roles?.length > 0 ? (
                        user.roles.map((role: string) => (
                          <Badge key={role} variant="secondary">{role}</Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No roles assigned</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Pro Status:</span>
                    <Badge variant={user.is_pro ? "default" : "outline"}>
                      {user.is_pro ? "Pro User" : "Regular User"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Last Sign In:</span>
                    <span className="text-muted-foreground">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role management could be added here in the future */}
            <div className="space-y-2 pt-4 border-t">
              <h4 className="font-medium">Admin Actions</h4>
              <p className="text-sm text-muted-foreground">
                Role management and other admin actions will be available here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}