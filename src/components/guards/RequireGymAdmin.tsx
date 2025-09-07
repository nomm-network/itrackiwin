import { useIsGymAdmin } from "@/hooks/useIsGymAdmin";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";

interface RequireGymAdminProps {
  children: React.ReactNode;
}

export default function RequireGymAdmin({ children }: RequireGymAdminProps) {
  const { gymId } = useParams();
  const { isAdmin, isLoading } = useIsGymAdmin(gymId);

  if (isLoading) {
    return (
      <main className="container py-12">
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking permissions...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isAdmin === false) {
    return (
      <main className="container py-12">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have administrator privileges for this gym.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}