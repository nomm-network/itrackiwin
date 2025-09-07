import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Building2, FileText, Calendar, Camera, ExternalLink } from "lucide-react";

export default function AmbassadorPanelPage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAmbassadorData() {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        // Load ambassador profile
        const { data: profileData } = await supabase
          .from("ambassador_profiles")
          .select("*")
          .eq("user_id", user.user.id)
          .single();

        // Load ambassador stats
        const { data: statsData } = await supabase
          .from("v_ambassador_summary")
          .select("*")
          .eq("ambassador_id", user.user.id)
          .single();

        setProfile(profileData);
        setStats(statsData);
      } catch (error) {
        console.error("Error loading ambassador data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAmbassadorData();
  }, []);

  if (loading) {
    return (
      <main className="container py-12">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading ambassador panel...</span>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="container py-12">
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Not an Ambassador</h2>
            <p className="text-muted-foreground mb-6">
              You don't have an ambassador profile yet. Contact support to become an ambassador.
            </p>
            <Button variant="outline">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Ambassador Panel</h1>
            <p className="text-muted-foreground">
              City battles, deals & visits (your profile)
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-primary">{stats?.verified_deals_total ?? 0}</div>
              <div className="text-sm text-muted-foreground">Verified Deals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-primary">{stats?.total_gym_visits ?? 0}</div>
              <div className="text-sm text-muted-foreground">Gym Visits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-primary">{stats?.gyms_signed ?? 0}</div>
              <div className="text-sm text-muted-foreground">Gyms Signed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                {profile.status}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Status</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="invitations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="deals">Submit Deal</TabsTrigger>
          <TabsTrigger value="visits">Visits & Poster Proof</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
          <TabsTrigger value="gyms">My Gyms</TabsTrigger>
        </TabsList>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Battle Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No pending invitations. Check back for new battle opportunities.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle>Submit New Deal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">
                Submit a new gym partnership deal for verification.
              </p>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Create Deal Submission
              </Button>
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Find gyms to approach
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits">
          <Card>
            <CardHeader>
              <CardTitle>Visits & Poster Proof</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">
                Log your gym visits and upload poster proof photos.
              </p>
              <div className="flex gap-2">
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Log Visit
                </Button>
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Poster Proof
                </Button>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get assets (download flyer kit)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements">
          <Card>
            <CardHeader>
              <CardTitle>Commission Statements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View and export your monthly commission statements.
              </p>
              <Button variant="outline">
                Export Current Month
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gyms">
          <Card>
            <CardHeader>
              <CardTitle>My Partner Gyms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Quick access to gyms where you have observer roles.
              </p>
              <div className="grid gap-4 mt-4">
                {/* Placeholder for gym list */}
                <div className="text-center py-8 text-muted-foreground">
                  No partner gyms yet. Sign your first deal to get started!
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}