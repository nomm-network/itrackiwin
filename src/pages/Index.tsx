import React, { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Orbits from "@/pages/Orbits";

const Index: React.FC = () => {
  const [checked, setChecked] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecked(true);
    });
  }, []);

  // Show loading state while checking auth
  if (!checked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - show orbits with dev links
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          {/* Dev Navigation */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀 Development & Demo Pages
                <Badge variant="outline">Dev</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/auth" className="block p-4 border rounded hover:bg-muted">
                  <h3 className="font-medium">🔐 Authentication</h3>
                  <p className="text-sm text-muted-foreground">Login or signup</p>
                </Link>
                
                <Link to="/translated-profile-demo" className="block p-4 border rounded hover:bg-muted">
                  <h3 className="font-medium">🌍 Translation Demo</h3>
                  <p className="text-sm text-muted-foreground">Multi-language profile page</p>
                </Link>
                
                <Link to="/translated-ai-coach" className="block p-4 border rounded hover:bg-muted">
                  <h3 className="font-medium">🤖 AI Coach i18n</h3>
                  <p className="text-sm text-muted-foreground">Translated AI coaching</p>
                </Link>
                
                <Link to="/mobile-polish-demo" className="block p-4 border rounded hover:bg-muted">
                  <h3 className="font-medium">📱 Mobile Polish</h3>
                  <p className="text-sm text-muted-foreground">Touch-optimized responsive design</p>
                </Link>
                
                <Link to="/persona-seeding" className="block p-4 border rounded hover:bg-muted">
                  <h3 className="font-medium">🎭 Persona Seeding</h3>
                  <p className="text-sm text-muted-foreground">Create demo users for testing</p>
                </Link>
                
                <Link to="/flutterflow-integration" className="block p-4 border rounded hover:bg-muted">
                  <h3 className="font-medium">📋 FlutterFlow Docs</h3>
                  <p className="text-sm text-muted-foreground">API integration guide</p>
                </Link>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded">
                <p className="text-sm text-muted-foreground">
                  <strong>Demo Login Credentials:</strong>
                  <br />
                  • maria.demo@example.com (Newbie)
                  <br />
                  • alex.demo@example.com (Returning) 
                  <br />
                  • lee.demo@example.com (Advanced)
                  <br />
                  Password: DemoPass123!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Orbits Interface */}
        <Orbits />
      </div>
    );
  }

  // Authenticated - redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Index;