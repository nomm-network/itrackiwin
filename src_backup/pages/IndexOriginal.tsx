import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

  // Not authenticated - show orbits
  if (!session?.user) {
    return <Orbits />;
  }

  // Authenticated - redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Index;