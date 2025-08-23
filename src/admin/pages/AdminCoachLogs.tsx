import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronDown,
  Eye,
  AlertTriangle,
  BarChart3,
  User,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CoachLog {
  id: string;
  user_id: string;
  function_name: string;
  step: string;
  inputs: any;
  outputs: any;
  metadata: any;
  execution_time_ms?: number;
  success: boolean;
  error_message?: string;
  session_id?: string;
  created_at: string;
  profiles?: {
    display_name?: string;
  };
}

const AdminCoachLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<CoachLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<CoachLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFunction, setSelectedFunction] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [showSuccessOnly, setShowSuccessOnly] = useState(false);
  const [showFailuresOnly, setShowFailuresOnly] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const [availableFunctions, setAvailableFunctions] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, selectedFunction, selectedUser, showSuccessOnly, showFailuresOnly]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const { data: logsData, error } = await supabase
        .from('coach_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      // Separate query for user profiles
      const userIds = [...new Set(logsData?.map(log => log.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      // Merge logs with profile data
      const logsWithProfiles = logsData?.map(log => ({
        ...log,
        profiles: profilesData?.find(p => p.user_id === log.user_id)
      })) || [];

      setLogs(logsWithProfiles as CoachLog[]);

      // Extract unique functions and users for filters
      const functions = [...new Set(logsWithProfiles?.map(log => log.function_name) || [])];
      const users = [...new Map(
        logsWithProfiles?.map(log => [
          log.user_id, 
          { 
            id: log.user_id, 
            name: log.profiles?.display_name || `User ${log.user_id.slice(0, 8)}...` 
          }
        ]) || []
      ).values()];

      setAvailableFunctions(functions.sort());
      setAvailableUsers(users.sort((a, b) => a.name.localeCompare(b.name)));

    } catch (error) {
      console.error('Error loading coach logs:', error);
      toast.error('Failed to load coach logs');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.function_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.error_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.inputs).toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.outputs).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Function filter
    if (selectedFunction !== 'all') {
      filtered = filtered.filter(log => log.function_name === selectedFunction);
    }

    // User filter
    if (selectedUser !== 'all') {
      filtered = filtered.filter(log => log.user_id === selectedUser);
    }

    // Success/failure filters
    if (showSuccessOnly) {
      filtered = filtered.filter(log => log.success);
    }
    if (showFailuresOnly) {
      filtered = filtered.filter(log => !log.success);
    }

    setFilteredLogs(filtered);
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStepIcon = (step: string, success: boolean) => {
    if (!success) return <XCircle className="h-4 w-4 text-destructive" />;
    
    switch (step) {
      case 'input_validation':
        return <Search className="h-4 w-4 text-blue-500" />;
      case 'profile_retrieval':
        return <User className="h-4 w-4 text-green-500" />;
      case 'exercise_selection':
        return <Filter className="h-4 w-4 text-purple-500" />;
      case 'workout_structure':
        return <BarChart3 className="h-4 w-4 text-orange-500" />;
      case 'final_generation':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'completion':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const renderJsonData = (data: any, title: string) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <div className="space-y-2">
        <h5 className="font-medium text-sm">{title}</h5>
        <div className="bg-muted p-3 rounded text-xs">
          <pre className="whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-fluid-s">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading coach logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-fluid-s space-y-fluid-s">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-fluid-3xl font-bold">Coach Decision Logs</h1>
          <p className="text-muted-foreground mt-2">
            Debug and analyze AI coach decision traces
          </p>
        </div>
        <Button onClick={loadLogs} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Function</label>
              <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Functions</SelectItem>
                  {availableFunctions.map(fn => (
                    <SelectItem key={fn} value={fn}>{fn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex gap-2">
                <Button
                  variant={showSuccessOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowSuccessOnly(!showSuccessOnly);
                    setShowFailuresOnly(false);
                  }}
                >
                  Success Only
                </Button>
                <Button
                  variant={showFailuresOnly ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowFailuresOnly(!showFailuresOnly);
                    setShowSuccessOnly(false);
                  }}
                >
                  Failures Only
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total Logs: {logs.length}</span>
            <span>Filtered: {filteredLogs.length}</span>
            <span>Success Rate: {logs.length > 0 ? Math.round((logs.filter(l => l.success).length / logs.length) * 100) : 0}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No logs found matching the current filters.
            </AlertDescription>
          </Alert>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className={!log.success ? 'border-destructive' : ''}>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStepIcon(log.step, log.success)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{log.function_name}</span>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.step} • {formatTimestamp(log.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.execution_time_ms && (
                          <Badge variant="outline" className="text-xs">
                            {formatDuration(log.execution_time_ms)}
                          </Badge>
                        )}
                        <Badge variant={log.success ? "default" : "destructive"}>
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                        {log.profiles?.display_name && (
                          <Badge variant="secondary">
                            {log.profiles.display_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {log.error_message && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{log.error_message}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {renderJsonData(log.inputs, 'Inputs')}
                      {renderJsonData(log.outputs, 'Outputs')}
                    </div>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <>
                        <Separator />
                        {renderJsonData(log.metadata, 'Metadata')}
                      </>
                    )}

                    <Separator />
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Session ID: {log.session_id || 'N/A'}</span>
                      <span>Log ID: {log.id}</span>
                      <span>User ID: {log.user_id}</span>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCoachLogsPage;