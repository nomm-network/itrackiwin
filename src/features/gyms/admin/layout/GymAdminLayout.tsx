import { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useGym } from "@/hooks/useGyms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, BarChart3, Users, Settings, Dumbbell, QrCode, Image } from "lucide-react";
import RequireGymAdmin from "@/components/guards/RequireGymAdmin";
import PageNav from "@/components/PageNav";

interface GymAdminLayoutProps {
  children: ReactNode;
  currentTab?: string;
}

export default function GymAdminLayout({ children, currentTab = "dashboard" }: GymAdminLayoutProps) {
  const { gymId } = useParams();
  const { data: gym } = useGym(gymId);

  return (
    <RequireGymAdmin>
      <main className="container py-12">
        <PageNav current={`Gyms / ${gym?.name || 'Loading...'} / Admin`} />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Gym Administration</h1>
              <p className="text-lg text-muted-foreground">
                {gym?.name}, {gym?.city}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Global iT.iW Administration (not per-gym) - Manage this specific gym's operations
          </p>
        </div>

        <Tabs value={currentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="coaches" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Coaches
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Marketing
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab}>
            {children}
          </TabsContent>
        </Tabs>
      </main>
    </RequireGymAdmin>
  );
}