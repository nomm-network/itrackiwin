import React from 'react';
import { useGymCoaches, useDecideGymCoach } from '@/hooks/useGymCoaches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Check, X, Clock, UserCheck } from 'lucide-react';

interface GymCoachesTabProps {
  gymId: string;
  isAdmin: boolean | null;
}

export default function GymCoachesTab({ gymId, isAdmin }: GymCoachesTabProps) {
  const { data: coaches, isLoading, error } = useGymCoaches(gymId);
  const decideCoach = useDecideGymCoach();

  const handleApprove = async (mentorId: string) => {
    try {
      await decideCoach.mutateAsync({
        gymId,
        mentorId,
        status: 'active',
      });
    } catch (error) {
      console.error('Failed to approve coach:', error);
    }
  };

  const handleReject = async (mentorId: string) => {
    try {
      await decideCoach.mutateAsync({
        gymId,
        mentorId,
        status: 'rejected',
      });
    } catch (error) {
      console.error('Failed to reject coach:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'removed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      case 'removed':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getMentorTypeColor = (type: string) => {
    return type === 'coach' 
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Coaches & Mentors</h3>
        <p className="text-sm text-muted-foreground">Manage coach membership requests and active coaches</p>
      </div>

      {/* Coaches List */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading coaches...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Coaches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && coaches && (
        <>
          <div className="grid gap-4">
            {coaches.map((membership) => (
              <Card key={membership.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">
                          {membership.mentor?.display_name || 'Unknown Coach'}
                        </h4>
                        {membership.mentor && (
                          <Badge variant="outline" className={getMentorTypeColor(membership.mentor.mentor_type)}>
                            {membership.mentor.mentor_type}
                          </Badge>
                        )}
                        <Badge variant="outline" className={getStatusColor(membership.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(membership.status)}
                            {membership.status}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Mentor ID:</span>
                          <p className="mt-1 font-mono text-xs">{membership.mentor_id.substring(0, 8)}...</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Requested:</span>
                          <p className="mt-1">{new Date(membership.created_at).toLocaleDateString()}</p>
                        </div>
                        {membership.decided_at && (
                          <div>
                            <span className="font-medium text-muted-foreground">Decided:</span>
                            <p className="mt-1">{new Date(membership.decided_at).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons for Pending Requests */}
                    {isAdmin && membership.status === 'pending' && (
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(membership.mentor_id)}
                          disabled={decideCoach.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(membership.mentor_id)}
                          disabled={decideCoach.isPending}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {coaches.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-3">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-medium">No coaches yet</h3>
                  <p className="text-muted-foreground">
                    Coaches can request to join your gym using the QR code in the Overview tab.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Summary */}
      {!isLoading && coaches && coaches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Total Requests:</span>
                <p className="mt-1 text-lg font-semibold">{coaches.length}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Active:</span>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  {coaches.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Pending:</span>
                <p className="mt-1 text-lg font-semibold text-yellow-600">
                  {coaches.filter(c => c.status === 'pending').length}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Rejected:</span>
                <p className="mt-1 text-lg font-semibold text-red-600">
                  {coaches.filter(c => c.status === 'rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}