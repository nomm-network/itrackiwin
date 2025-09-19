import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserPriorities } from "@/hooks/useUserPriorities";
import { useNextBestCategory } from "@/hooks/useNextBestCategory";
import { CheckCircle, XCircle, Clock, TestTube } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  details?: string;
}

export function AtlasTestingComponent() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();
  
  const { data: priorities, isLoading: prioritiesLoading, error: prioritiesError } = useUserPriorities();
  const { data: nextBest, isLoading: nextBestLoading, error: nextBestError } = useNextBestCategory();

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Database Functions
    results.push({
      name: "User Priorities RPC Function",
      status: prioritiesError ? 'fail' : (priorities ? 'pass' : 'pending'),
      details: prioritiesError ? prioritiesError.message : `Found ${priorities?.length || 0} priorities`
    });

    results.push({
      name: "Next Best Category RPC Function", 
      status: nextBestError ? 'fail' : (nextBest !== undefined ? 'pass' : 'pending'),
      details: nextBestError ? nextBestError.message : (nextBest ? `Next: ${nextBest.name}` : 'No next category')
    });

    // Test 2: Edge Function
    try {
      const response = await fetch('https://fsayiuhncisevhipbrak.supabase.co/functions/v1/router-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: 'test-user', message: 'I need a workout plan' })
      });
      
      if (response.ok) {
        const data = await response.json();
        results.push({
          name: "Router Chat Edge Function",
          status: data.handoff?.category_slug === 'health' ? 'pass' : 'fail',
          details: `Response: ${data.text}, Handoff: ${data.handoff?.category_slug || 'none'}`
        });
      } else {
        results.push({
          name: "Router Chat Edge Function",
          status: 'fail',
          details: `HTTP ${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      results.push({
        name: "Router Chat Edge Function",
        status: 'fail',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: General Atlas Response
    try {
      const response = await fetch('https://fsayiuhncisevhipbrak.supabase.co/functions/v1/router-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: 'test-user', message: 'hi' })
      });
      
      if (response.ok) {
        const data = await response.json();
        results.push({
          name: "Atlas General Response",
          status: data.role === 'atlas' && !data.handoff ? 'pass' : 'fail',
          details: `Role: ${data.role}, Message: ${data.text.substring(0, 50)}...`
        });
      } else {
        results.push({
          name: "Atlas General Response",
          status: 'fail',
          details: `HTTP ${response.status}`
        });
      }
    } catch (error) {
      results.push({
        name: "Atlas General Response",
        status: 'fail',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pass: 'default' as const,
      fail: 'destructive' as const,
      pending: 'secondary' as const
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Atlas (Step 4) Testing Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runTests} disabled={isRunning}>
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/planets')}>
              Go to Atlas Page
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Test Results:</h3>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {result.details && (
                      <span className="text-sm text-muted-foreground">{result.details}</span>
                    )}
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Data Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">User Priorities:</h4>
            {prioritiesLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : priorities && priorities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {priorities.map((priority, index) => (
                  <Badge key={priority.category_id} variant={index === 0 ? "default" : "secondary"}>
                    {priority.icon} {priority.name} (#{priority.priority_rank})
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No priorities found. Set up navigation in Settings.</p>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Next Best Category:</h4>
            {nextBestLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : nextBest ? (
              <Badge>{nextBest.name}</Badge>
            ) : (
              <p className="text-sm text-muted-foreground">No next category found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QA Checklist for Step 4</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium">Manual Testing Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Ensure you have at least 2 pinned categories in Settings</li>
                <li>Visit /planets - should show priorities and next best action</li>
                <li>Type "I need a workout plan" in Ask Atlas - should route to /area/health</li>
                <li>Type "how do I save money" - should route to /area/wealth</li>
                <li>Type "hi" - should stay on page with Atlas response</li>
                <li>Bottom nav Atlas tab should work from anywhere</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}