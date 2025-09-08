import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GymAdminsTable } from "./GymAdminsTable";
import { GymRoleRequestsTable } from "./GymRoleRequestsTable";

interface GymAdminSettingsTabProps {
  gymId: string;
}

export function GymAdminSettingsTab({ gymId }: GymAdminSettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gym Administration</CardTitle>
          <CardDescription>
            Manage gym administrators, staff, and member requests
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="admins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="admins">Administrators</TabsTrigger>
          <TabsTrigger value="requests">Role Requests</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Gym Administrators</CardTitle>
              <CardDescription>
                Manage who can administer this gym
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GymAdminsTable gymId={gymId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Role Requests</CardTitle>
              <CardDescription>
                Review and approve role requests for this gym
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GymRoleRequestsTable gymId={gymId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                View and manage gym members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Member management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}