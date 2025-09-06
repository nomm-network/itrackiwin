import React from 'react';
import { useParams } from 'react-router-dom';
import { useGym } from '@/hooks/useGyms';
import { useIsGymAdmin } from '@/hooks/useIsGymAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, Settings, Dumbbell } from 'lucide-react';
import PageNav from '@/components/PageNav';
import GymOverviewTab from '../components/GymOverviewTab';
import GymAdminsTab from '../components/GymAdminsTab';
import GymCoachesTab from '../components/GymCoachesTab';
import GymEquipmentTab from '../components/GymEquipmentTab';

export default function GymDetailPage() {
  const { gymId } = useParams<{ gymId: string }>();
  const { data: gym, isLoading, error } = useGym(gymId);
  const { isAdmin, isLoading: isLoadingAdmin } = useIsGymAdmin(gymId);

  if (isLoading || isLoadingAdmin) {
    return (
      <main className="container py-12">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading gym details...</span>
        </div>
      </main>
    );
  }

  if (error || !gym) {
    return (
      <main className="container py-12">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Gym</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              {error instanceof Error ? error.message : "Gym not found"}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <main className="container py-12">
      <PageNav current={`Gyms / ${gym.name}`} />
      
      <div className="space-y-6">
        {/* Gym Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                  <h1 className="text-2xl font-bold">{gym.name}</h1>
                  <Badge variant="outline" className={getStatusColor(gym.status)}>
                    {gym.status}
                  </Badge>
                  {isAdmin && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Admin
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {gym.city && gym.country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{gym.city}, {gym.country}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Created {new Date(gym.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {gym.address && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Address:</span> {gym.address}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gym Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="coaches" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Coaches
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Equipment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <GymOverviewTab gym={gym} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="admins">
            <GymAdminsTab gymId={gym.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="coaches">
            <GymCoachesTab gymId={gym.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="equipment">
            <GymEquipmentTab gymId={gym.id} isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}