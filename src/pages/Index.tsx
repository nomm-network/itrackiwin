import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FitnessFirstLanding from "@/components/FitnessFirstLanding";

const Index: React.FC = () => {
  const [checked, setChecked] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecked(true);
    });
  }, []);

  // Authenticated - redirect to dashboard
  useEffect(() => {
    if (session?.user && checked) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, checked, navigate]);

  // Show loading state while checking auth
  if (!checked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - show fitness-first landing
  if (!session?.user) {
    return <FitnessFirstLanding />;
  }

  // Show loading while redirecting authenticated users
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default Index;