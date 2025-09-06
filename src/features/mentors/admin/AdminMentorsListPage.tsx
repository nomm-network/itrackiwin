import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMentors } from './hooks/useMentors';
import { useDeleteMentor } from './hooks/useDeleteMentor';
import PageNav from '@/components/PageNav';
import AdminMenu from '@/admin/components/AdminMenu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Eye, RefreshCw, Plus } from 'lucide-react';

const AdminMentorsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: mentors, isLoading, error, refetch } = useMentors();
  const deleteMentor = useDeleteMentor();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mentorToDelete, setMentorToDelete] = useState<any>(null);

  const handleDeleteClick = (mentor: any) => {
    setMentorToDelete(mentor);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (mentorToDelete) {
      await deleteMentor.mutateAsync(mentorToDelete.id);
      setDeleteDialogOpen(false);
      setMentorToDelete(null);
    }
  };

  const getMentorTypeColor = (type: string) => {
    return type === 'coach' 
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <main className="container py-12">
      <PageNav current="Admin / Mentors" />
      <AdminMenu />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mentors & Coaches</h1>
            <p className="text-muted-foreground mt-1">Manage mentor profiles and settings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => navigate('/admin/mentors/new')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              New Mentor
            </Button>
          </div>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Loading mentors...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800">Error Loading Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && mentors && (
          <>
            <div className="grid gap-4">
              {mentors?.map((mentor: any) => (
                <Card key={mentor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {mentor.display_name || 'Unknown Name'}
                          </h3>
                          <Badge variant="outline" className={getMentorTypeColor(mentor.mentor_type)}>
                            {mentor.mentor_type}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(mentor.is_active)}>
                            {mentor.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Email:</span>
                            <p className="mt-1">{mentor.email || '—'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">User ID:</span>
                            <p className="mt-1 font-mono text-xs">{mentor.user_id?.substring(0, 8)}...</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Hourly Rate:</span>
                            <p className="mt-1">{mentor.hourly_rate ? `$${mentor.hourly_rate}` : '—'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Created:</span>
                            <p className="mt-1">{new Date(mentor.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {mentor.bio && (
                          <div>
                            <span className="font-medium text-muted-foreground">Bio:</span>
                            <p className="mt-1 text-sm line-clamp-2">{mentor.bio}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/mentors/${mentor.id}`)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/mentors/${mentor.id}/edit`)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(mentor)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {mentors?.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">No mentors yet</h3>
                    <p className="text-muted-foreground">Get started by creating your first mentor profile.</p>
                    <Button onClick={() => navigate('/admin/mentors/new')} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Mentor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Summary Statistics */}
        {!isLoading && mentors && mentors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Total Mentors:</span>
                  <p className="mt-1 text-lg font-semibold">{mentors.length}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Active:</span>
                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {mentors.filter(m => m.is_active).length}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Coaches:</span>
                  <p className="mt-1 text-lg font-semibold text-purple-600">
                    {mentors.filter(m => m.mentor_type === 'coach').length}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Mentors:</span>
                  <p className="mt-1 text-lg font-semibold text-blue-600">
                    {mentors.filter(m => m.mentor_type === 'mentor').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mentor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {mentorToDelete?.display_name || 'this mentor'}? 
              This action cannot be undone and will permanently remove their profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteMentor.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMentor.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default AdminMentorsListPage;