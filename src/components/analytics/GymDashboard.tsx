import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  Dumbbell, 
  Settings, 
  Camera,
  TrendingUp
} from "lucide-react";
import { 
  useGymActivity, 
  useGymTopExercises, 
  useGymEquipmentCompleteness, 
  useGymPosterFreshness,
  runCommissionAccruals
} from "@/hooks/useAnalytics";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { format } from "date-fns";

interface GymDashboardProps {
  gymId: string;
}

export const GymDashboard = ({ gymId }: GymDashboardProps) => {
  const { data: activity } = useGymActivity(gymId);
  const { data: topExercises } = useGymTopExercises(gymId);
  const { data: equipmentCompleteness } = useGymEquipmentCompleteness(gymId);
  const { data: posterFreshness } = useGymPosterFreshness(gymId);
  const { isSuperAdmin } = useUserRole();

  const gymActivity = activity?.[0];

  const handleRunAccruals = async () => {
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      await runCommissionAccruals(
        lastMonth.getFullYear(),
        lastMonth.getMonth() + 1
      );
      
      toast.success("Commission accruals calculated successfully");
    } catch (error) {
      console.error("Error running accruals:", error);
      toast.error("Failed to calculate commission accruals");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gym Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor gym activity, equipment, and ambassador engagement
          </p>
        </div>
        
        {isSuperAdmin && (
          <Button onClick={handleRunAccruals} variant="outline">
            Run Last Month Accruals
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gymActivity?.active_members || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gymActivity?.active_coaches || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts (7d)</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gymActivity?.workouts_7d || 0}</div>
            <p className="text-xs text-muted-foreground">
              {gymActivity?.workouts_30d || 0} in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipment Coverage</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {equipmentCompleteness?.overrides_coverage_pct || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {equipmentCompleteness?.overrides_count || 0} of {equipmentCompleteness?.defaults_available || 0} configured
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Poster Freshness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Poster Verification
            </CardTitle>
            <CardDescription>
              Last ambassador poster proof submission
            </CardDescription>
          </CardHeader>
          <CardContent>
            {posterFreshness?.last_poster_proof_at ? (
              <div>
                <p className="text-sm text-muted-foreground">Last proof:</p>
                <p className="font-medium">
                  {format(new Date(posterFreshness.last_poster_proof_at), 'PPP')}
                </p>
                <Badge 
                  variant={
                    new Date().getTime() - new Date(posterFreshness.last_poster_proof_at).getTime() 
                    > 60 * 24 * 60 * 60 * 1000 ? "destructive" : "secondary"
                  }
                  className="mt-2"
                >
                  {new Date().getTime() - new Date(posterFreshness.last_poster_proof_at).getTime() 
                  > 60 * 24 * 60 * 60 * 1000 ? "Needs Update" : "Current"}
                </Badge>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground">No poster proofs yet</p>
                <Badge variant="destructive" className="mt-2">
                  Action Required
                </Badge>
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-4 w-full">
              Upload New Proof
            </Button>
          </CardContent>
        </Card>

        {/* Top Exercises */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Exercises (30 days)
            </CardTitle>
            <CardDescription>
              Most popular exercises at this gym
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topExercises?.slice(0, 5).map((exercise, index) => (
                <div key={exercise.exercise_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">
                      {exercise.exercise_name}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {exercise.usages_30d} uses
                  </Badge>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No exercise data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};