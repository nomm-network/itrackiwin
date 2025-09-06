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

  // Get current coach assignments
  const coachAssignments = Array.isArray(user.assignments) ? 
    user.assignments.filter((a: any) => a.mentor_type === 'coach') : [];
  
  // Get available categories for assignment
  const assignedCategoryIds = coachAssignments.map((a: any) => a.life_category_id);
  const availableCategories = categories?.filter(cat => !assignedCategoryIds.includes(cat.id)) || [];

  return (
    <main className="container py-12">
      <PageNav current="Admin / Users / User Detail" />
      <AdminMenu />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              User ID: {user.user_id}
            </p>
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
            {/* Current assignments */}
            {coachAssignments.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-medium">Current Assignments</h4>
                <div className="space-y-2">
                  {coachAssignments.map((assignment: any) => {
                    const category = categories?.find(c => c.id === assignment.life_category_id);
                    return (
                      <div key={assignment.life_category_id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Coach</Badge>
                          <span>{category?.name || category?.slug || 'Unknown Category'}</span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleToggleCoach(assignment.life_category_id, true)}
                          disabled={settingCoach}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No coach assignments</p>
            )}

            {/* Add new assignment */}
            {availableCategories.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium">Add Coach Assignment</h4>
                <div className="flex gap-2">
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name || category.slug}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddCoachAssignment}
                    disabled={!selectedCategoryId || settingCoach}
                  >
                    Add Coach
                  </Button>
                </div>
              </div>
            )}

            {availableCategories.length === 0 && coachAssignments.length > 0 && (
              <p className="text-sm text-muted-foreground pt-4 border-t">
                User is already assigned as coach to all available categories
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}