import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin } from "lucide-react";
import { JoinGymCodeModal } from "../components/JoinGymCodeModal";

interface UserGym {
  gym_id: string;
  created_at: string;
  gym: {
    id: string;
    name: string;
    city?: string;
    country?: string;
    address?: string;
  };
}

export default function GymsListPage() {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { data: userGyms, refetch } = useQuery({
    queryKey: ["user-gyms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_gym_memberships")
        .select(`
          gym_id,
          created_at,
          gym:gyms(id, name, city, country, address)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserGym[];
    },
  });

  const handleLeaveGym = async (gymId: string) => {
    const { error } = await supabase
      .from("user_gym_memberships")
      .delete()
      .eq("gym_id", gymId)
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      console.error("Error leaving gym:", error);
      return;
    }

    refetch();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Gyms</h1>
          <p className="text-muted-foreground">
            Manage your gym memberships and access gym-specific features
          </p>
        </div>
        <Button onClick={() => setShowJoinModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Join Gym
        </Button>
      </div>

      {!userGyms?.length ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No gyms yet</h3>
              <p className="text-muted-foreground mb-4">
                Join a gym to access equipment tracking, coaching, and more features
              </p>
              <Button onClick={() => setShowJoinModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Join Your First Gym
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {userGyms.map((membership) => (
            <Card key={membership.gym_id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1" onClick={() => navigate(`/gyms/${membership.gym_id}`)}>
                  <CardTitle className="flex items-center gap-2">
                    {membership.gym.name}
                    <Badge variant="secondary">Active</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {membership.gym.city && membership.gym.country && 
                      `${membership.gym.city}, ${membership.gym.country}`
                    }
                    {membership.gym.address && ` • ${membership.gym.address}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/gyms/${membership.gym_id}`);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLeaveGym(membership.gym_id);
                    }}
                  >
                    Leave
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <JoinGymCodeModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        onSuccess={() => refetch()}
      />
    </div>
  );
}