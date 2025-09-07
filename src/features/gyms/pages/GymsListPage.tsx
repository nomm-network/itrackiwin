import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Plus, QrCode } from "lucide-react";

export default function GymsListPage() {
  const [userGyms, setUserGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserGyms() {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data } = await supabase
          .from("user_gym_memberships")
          .select(`
            id,
            role,
            status,
            gyms!inner(
              id,
              name,
              city,
              country,
              address
            )
          `)
          .eq("user_id", user.user.id);

        setUserGyms(data ?? []);
      } catch (error) {
        console.error("Error loading user gyms:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserGyms();
  }, []);

  if (loading) {
    return (
      <main className="container py-12">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading your gyms...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Gyms</h1>
          <p className="text-muted-foreground mt-2">
            Manage your gym memberships and discover new ones
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/marketplace">
              <Building2 className="h-4 w-4 mr-2" />
              Discover Gyms
            </Link>
          </Button>
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Join via QR
          </Button>
        </div>
      </div>

      {userGyms.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No gyms yet</h3>
            <p className="text-muted-foreground mb-6">
              You're not a member of any gyms. Discover gyms in your area or join with a QR code.
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link to="/marketplace">
                  <Building2 className="h-4 w-4 mr-2" />
                  Discover Gyms
                </Link>
              </Button>
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Join via QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userGyms.map((membership) => {
            const gym = membership.gyms;
            return (
              <Card key={membership.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{gym.name}</CardTitle>
                    <Badge variant={membership.status === 'active' ? 'default' : 'secondary'}>
                      {membership.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {gym.city && gym.country ? `${gym.city}, ${gym.country}` : gym.address || 'Location not specified'}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="capitalize">{membership.role}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/gyms/${gym.id}`}>
                        Open Gym
                      </Link>
                    </Button>
                    
                    {membership.role === 'member' && (
                      <Button variant="outline" size="sm">
                        Leave
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}