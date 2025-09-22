import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FitnessFirstLanding from "@/components/FitnessFirstLanding";

const Index: React.FC = () => {
  const [checked, setChecked] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index: Starting auth check');
    
    // Listen for auth state changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Index: Auth state changed:', event, !!session?.user);
      setSession(session);
      setChecked(true);
    });
    
    // Then check current session
    supabase.auth.getSession().then(({ data }) => {
      console.log('Index: Session data:', !!data.session?.user);
      setSession(data.session);
      setChecked(true);
    }).catch((error) => {
      console.error('Index: Session check error:', error);
      setChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Authenticated - redirect to dashboard
  useEffect(() => {
    console.log('Index: Auth effect triggered, session:', !!session?.user, 'checked:', checked);
    if (session?.user && checked) {
      console.log('Index: Redirecting to dashboard');
      // Force navigation for Safari compatibility
      window.location.replace('/dashboard');
    }
  }, [session, checked]);

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