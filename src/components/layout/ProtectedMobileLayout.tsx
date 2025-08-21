import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "./MobileLayout";

interface ProtectedMobileLayoutProps {
  children: React.ReactNode;
}

const ProtectedMobileLayout: React.FC<ProtectedMobileLayoutProps> = ({ children }) => {
  const location = useLocation();

  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <MobileLayout>
      {children}
    </MobileLayout>
  );
};

export default ProtectedMobileLayout;