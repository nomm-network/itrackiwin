import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  MapPin, 
  DollarSign, 
  Camera,
  Calendar
} from "lucide-react";
import { 
  useAmbassadorSummary, 
  useAmbassadorCommissionSummary
} from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export const AmbassadorDashboard = () => {
  const { user } = useAuth();
  const { data: summaries } = useAmbassadorSummary(user?.id);
  const summary = summaries?.[0];
  
  const { data: commissionSummary } = useAmbassadorCommissionSummary(
    summary?.ambassador_id || ''
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Ambassador Dashboard</h1>
        <p className="text-muted-foreground">
          Track your deals, visits, and commission earnings
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Deals</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.verified_deals_total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total active gym partnerships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visits MTD</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.visits_mtd || 0}</div>
            <p className="text-xs text-muted-foreground">
              Gym visits this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission MTD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(commissionSummary?.commission_mtd || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Earned this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(commissionSummary?.commission_last_month || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Previous month earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Last Visit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Latest Activity
            </CardTitle>
            <CardDescription>
              Your most recent gym visit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.last_visit_at ? (
              <div>
                <p className="text-sm text-muted-foreground">Last visit:</p>
                <p className="font-medium">
                  {format(new Date(summary.last_visit_at), 'PPP')}
                </p>
                <Badge 
                  variant={
                    new Date().getTime() - new Date(summary.last_visit_at).getTime() 
                    > 30 * 24 * 60 * 60 * 1000 ? "destructive" : "secondary"
                  }
                  className="mt-2"
                >
                  {new Date().getTime() - new Date(summary.last_visit_at).getTime() 
                  > 30 * 24 * 60 * 60 * 1000 ? "Overdue" : "Recent"}
                </Badge>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground">No visits recorded yet</p>
                <Badge variant="destructive" className="mt-2">
                  Schedule Visit
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common ambassador tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="mr-2 h-4 w-4" />
              Log Gym Visit
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Camera className="mr-2 h-4 w-4" />
              Upload Poster Photo
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Award className="mr-2 h-4 w-4" />
              View My Deals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};