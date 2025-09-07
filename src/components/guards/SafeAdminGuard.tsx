import { ReactNode, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";

type Props = {
  children: ReactNode;
  redirectOnUnauthorized?: boolean; // set true if you want to redirect
  redirectTo?: string;              // e.g. "/"
};

export function SafeAdminGuard({
  children,
  redirectOnUnauthorized = false,
  redirectTo = "/",
}: Props) {
  const admin = useIsSuperAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (admin.status === "unauthorized" && redirectOnUnauthorized && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate(redirectTo, { replace: true, state: { from: location.pathname } });
    }
  }, [admin.status, redirectOnUnauthorized, redirectTo, navigate, location.pathname]);

  if (admin.status === "loading") {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold mb-2">Checking admin access…</h2>
          <p className="text-muted-foreground">Please wait.</p>
        </div>
      </div>
    );
  }

  if (admin.status === "error") {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Admin check failed</h2>
          <pre className="text-sm bg-red-50 p-4 rounded text-left whitespace-pre-wrap">
            {admin.message}
          </pre>
          <div className="mt-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (admin.status === "unauthorized" && !redirectOnUnauthorized) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold text-orange-600 mb-2">Unauthorized</h2>
          <p className="text-muted-foreground mb-4">
            You don't have superadmin rights for this section.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Debug info:</p>
            <p>- You appear to be logged in but lack admin role</p>
            <p>- Check if your user has 'superadmin' role in user_roles table</p>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => navigate("/")} 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default SafeAdminGuard;