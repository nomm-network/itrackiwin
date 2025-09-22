import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  Users,
  Camera
} from "lucide-react";
import { useGymsNeedingPosterCheck } from "@/hooks/useAnalytics";
import { format, formatDistanceToNow } from "date-fns";

export const OperationsAlerts = () => {
  const { data: gymsNeedingCheck } = useGymsNeedingPosterCheck();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Operations Alerts</h1>
        <p className="text-muted-foreground">
          Monitor system health and required actions
        </p>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-destructive/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stale Posters</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {gymsNeedingCheck?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Gyms need poster updates
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idle Ambassadors</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <p className="text-xs text-muted-foreground">
              No visits in 30+ days
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deals</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gyms Needing Poster Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Gyms Needing Poster Check
          </CardTitle>
          <CardDescription>
            Gyms without recent poster proof submissions (60+ days)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gymsNeedingCheck && gymsNeedingCheck.length > 0 ? (
            <div className="space-y-3">
              {gymsNeedingCheck.map((gym) => (
                <div 
                  key={gym.gym_id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{gym.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Last proof: {gym.last_poster_proof_at === '1900-01-01T00:00:00+00:00' 
                        ? 'Never' 
                        : format(new Date(gym.last_poster_proof_at), 'PPP')
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {gym.last_poster_proof_at === '1900-01-01T00:00:00+00:00' 
                        ? 'Never checked' 
                        : `${formatDistanceToNow(new Date(gym.last_poster_proof_at))} ago`
                      }
                    </Badge>
                    <Button size="sm" variant="outline">
                      Contact Ambassador
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-sm font-medium">All gyms up to date</h3>
              <p className="text-sm text-muted-foreground">
                No gyms require poster proof updates at this time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Idle Ambassadors (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Idle Ambassadors
          </CardTitle>
          <CardDescription>
            Ambassadors with verified deals but no recent activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-2 text-sm font-medium">All ambassadors active</h3>
            <p className="text-sm text-muted-foreground">
              No ambassadors require follow-up at this time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};