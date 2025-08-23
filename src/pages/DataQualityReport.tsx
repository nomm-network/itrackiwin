import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Database, 
  BarChart3,
  RefreshCw,
  Download,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DataQualityReport {
  id: string;
  created_at: string;
  total_exercises: number;
  exercises_with_primary_muscle: number;
  exercises_with_movement_pattern: number;
  exercises_with_equipment_constraints: number;
  primary_muscle_coverage_pct: number;
  movement_pattern_coverage_pct: number;
  equipment_constraints_coverage_pct: number;
  issues_found: any[];
  report_type: string;
}

interface TrendData {
  created_at: string;
  primary_muscle_coverage_pct: number;
  movement_pattern_coverage_pct: number;
  equipment_constraints_coverage_pct: number;
  total_exercises: number;
}

const DataQualityReport: React.FC = () => {
  const [latestReport, setLatestReport] = useState<DataQualityReport | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Load latest report
      const { data: reportData, error: reportError } = await supabase.functions.invoke(
        'data-quality-check',
        {
          body: { action: 'get_latest_report' }
        }
      );

      if (reportError) throw reportError;
      
      if (reportData?.report) {
        setLatestReport(reportData.report);
      }

      // Load trend data
      const { data: trendResponse, error: trendError } = await supabase.functions.invoke(
        'data-quality-check',
        {
          body: { action: 'get_trend' }
        }
      );

      if (trendError) throw trendError;
      
      if (trendResponse?.trend) {
        setTrendData(trendResponse.trend);
      }

    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: "Error",
        description: "Failed to load data quality reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runQualityCheck = async () => {
    try {
      setRunningCheck(true);
      
      const { data, error } = await supabase.functions.invoke('data-quality-check', {
        body: { action: 'run_check' }
      });

      if (error) throw error;

      toast({
        title: "Quality Check Complete",
        description: `Found ${data.report.summary.issues_count} issues across ${data.report.summary.total_exercises} exercises`
      });

      // Reload data
      await loadReportData();

    } catch (error) {
      console.error('Error running quality check:', error);
      toast({
        title: "Error",
        description: "Failed to run data quality check",
        variant: "destructive"
      });
    } finally {
      setRunningCheck(false);
    }
  };

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return 'default';
    if (percentage >= 70) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Database className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Data Quality Report</h1>
        </div>
        <div className="text-center">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Data Quality Report</h1>
        </div>
        <Button 
          onClick={runQualityCheck} 
          disabled={runningCheck}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${runningCheck ? 'animate-spin' : ''}`} />
          <span>{runningCheck ? 'Running Check...' : 'Run Quality Check'}</span>
        </Button>
      </div>

      {latestReport && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Last updated {formatDistanceToNow(new Date(latestReport.created_at), { addSuffix: true })}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {latestReport ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{latestReport.total_exercises}</div>
                  <p className="text-xs text-muted-foreground">Public exercises in catalog</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Primary Muscle</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getCoverageColor(latestReport.primary_muscle_coverage_pct)}`}>
                    {latestReport.primary_muscle_coverage_pct.toFixed(1)}%
                  </div>
                  <Progress value={latestReport.primary_muscle_coverage_pct} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {latestReport.exercises_with_primary_muscle} of {latestReport.total_exercises} exercises
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Movement Pattern</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getCoverageColor(latestReport.movement_pattern_coverage_pct)}`}>
                    {latestReport.movement_pattern_coverage_pct.toFixed(1)}%
                  </div>
                  <Progress value={latestReport.movement_pattern_coverage_pct} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {latestReport.exercises_with_movement_pattern} of {latestReport.total_exercises} exercises
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Equipment Constraints</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getCoverageColor(latestReport.equipment_constraints_coverage_pct)}`}>
                    {latestReport.equipment_constraints_coverage_pct.toFixed(1)}%
                  </div>
                  <Progress value={latestReport.equipment_constraints_coverage_pct} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Equipment-based exercises with constraints
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No quality reports available. Run your first check to get started.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {latestReport && latestReport.issues_found.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Issues Found ({latestReport.issues_found.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestReport.issues_found.slice(0, 20).map((issue: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{issue.exercise_name}</h4>
                        <div className="flex space-x-2 mt-1">
                          {issue.missing_primary_muscle && (
                            <Badge variant="destructive">Missing Primary Muscle</Badge>
                          )}
                          {issue.missing_movement_pattern && (
                            <Badge variant="destructive">Missing Movement Pattern</Badge>
                          )}
                          {issue.missing_equipment_constraints && (
                            <Badge variant="destructive">Missing Equipment Constraints</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {latestReport.issues_found.length > 20 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Showing first 20 of {latestReport.issues_found.length} issues
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No data quality issues found in the latest check.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Coverage Trends (Last 30 Days)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Showing data quality trends over the past 30 days
                  </p>
                  {/* Simple trend display - could be enhanced with a chart library */}
                  <div className="grid gap-4">
                    {trendData.slice(-7).map((point, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">
                          {new Date(point.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-4 text-sm">
                          <Badge variant={getCoverageBadgeVariant(point.primary_muscle_coverage_pct)}>
                            Primary: {point.primary_muscle_coverage_pct.toFixed(1)}%
                          </Badge>
                          <Badge variant={getCoverageBadgeVariant(point.movement_pattern_coverage_pct)}>
                            Movement: {point.movement_pattern_coverage_pct.toFixed(1)}%
                          </Badge>
                          <Badge variant={getCoverageBadgeVariant(point.equipment_constraints_coverage_pct)}>
                            Equipment: {point.equipment_constraints_coverage_pct.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Not enough data to show trends. Run quality checks over time to see trends.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataQualityReport;