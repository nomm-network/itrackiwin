import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsGymAdmin } from "@/hooks/useIsGymAdmin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar } from "lucide-react";
import { GymAdminSettingsTab } from "../components/GymAdminSettingsTab";

interface GymDetail {
  id: string;
  name: string;
  city?: string;
  country?: string;
  address?: string;
  status: string;
  verified?: boolean;
  created_at: string;
}

interface GymMembership {
  user_id: string;
  status: string;
  joined_at: string;
}

export default function GymDetailPage() {
  const { gymId } = useParams<{ gymId: string }>();
  const { isAdmin } = useIsGymAdmin(gymId);

  const { data: gym } = useQuery({
    queryKey: ["gym", gymId],
    queryFn: async () => {
      if (!gymId) throw new Error("Gym ID required");
      
      const { data, error } = await supabase
        .from("gyms")
        .select("*")
        .eq("id", gymId)
        .single();

      if (error) throw error;
      return data as GymDetail;
    },
    enabled: !!gymId,
  });

  const { data: memberCount } = useQuery({
    queryKey: ["gym-member-count", gymId],
    queryFn: async () => {
      if (!gymId) throw new Error("Gym ID required");
      
      const { count, error } = await supabase
        .from("user_gym_memberships")
        .select("*", { count: "exact", head: true })
        .eq("gym_id", gymId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!gymId,
  });

  if (!gym) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{gym.name}</h1>
          {gym.verified && <Badge variant="default">Verified</Badge>}
          <Badge variant="outline">{gym.status}</Badge>
        </div>
        
        <div className="flex items-center gap-4 text-muted-foreground">
          {gym.city && gym.country && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {gym.city}, {gym.country}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {memberCount} members
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Since {new Date(gym.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gym Information</CardTitle>
              <CardDescription>Basic details about this gym</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Address</label>
                <p className="text-sm text-muted-foreground">
                  {gym.address || "No address provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm text-muted-foreground">
                  {gym.status} {gym.verified && "• Verified"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Equipment</CardTitle>
              <CardDescription>Available equipment at this gym</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Equipment management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <GymAdminSettingsTab gymId={gymId!} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}