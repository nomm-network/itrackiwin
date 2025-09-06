import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Crown } from 'lucide-react';
import { useMentors } from './hooks/useMentors';
import { format } from 'date-fns';

const AdminMentorsListPage = () => {
  const navigate = useNavigate();
  const { data: mentors, isLoading, error } = useMentors();

  const handleRowClick = (id: string) => {
    navigate(`/admin/mentors/${id}`);
  };

  const handleNewMentor = () => {
    navigate('/admin/mentors/new');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-destructive">Error loading mentors: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mentors Management</h1>
          <p className="text-muted-foreground">Manage mentors and coaches in the system</p>
        </div>
        <Button onClick={handleNewMentor} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Mentor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mentors ({mentors?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Primary Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentors?.length ? (
                mentors.map((mentor) => (
                  <TableRow
                    key={mentor.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(mentor.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {mentor.display_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {mentor.mentor_type === 'coach' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        <Badge variant={mentor.mentor_type === 'coach' ? 'default' : 'secondary'}>
                          {mentor.mentor_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {mentor.primary_category_id ? (
                        <Badge variant="outline">Category Set</Badge>
                      ) : (
                        <span className="text-muted-foreground">No category</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={mentor.is_public ? 'default' : 'secondary'}>
                        {mentor.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {mentor.hourly_rate ? (
                        <span className="font-medium">${mentor.hourly_rate}/hr</span>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(mentor.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No mentors found</p>
                      <p className="text-sm">Create your first mentor to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMentorsListPage;