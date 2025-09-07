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
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Gym not found</h2>
            <p className="text-muted-foreground">
              The gym you're looking for doesn't exist or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container py-12">
      <PageNav current={`Gyms / ${gym.name}`} />
      
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{gym.name}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {gym.city && gym.country 
                  ? `${gym.city}, ${gym.country}` 
                  : gym.address || 'Location not specified'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {gym.verified && (
              <Badge variant="secondary">
                Verified
              </Badge>
            )}
            {isAdmin && (
              <Badge variant="default">
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Equipment
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="admins" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Admins
              </TabsTrigger>
              <TabsTrigger value="coaches" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Coaches
              </TabsTrigger>
            </>
          )}
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
    </main>
  );
}