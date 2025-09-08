import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ✅ Canonical pages
const HubPage = lazy(() => import("@/features/hub/HubPage"));
const AdminPage = lazy(() => import("@/admin/routes").then(module => ({ default: module.AdminRoutes })));
const PlanetsPage = lazy(() => import("@/features/planets/PlanetsPage"));

// ✅ Layout wrapper
const ProtectedMobileLayout = lazy(() => import("@/components/layout/ProtectedMobileLayout"));

// ✅ Auth Guard (simplified)
const AuthGuard = ({ children }: any) => children; // replace with real guard if needed

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>

        {/* ======= Public canonical ======= */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedMobileLayout>
              <HubPage />
            </ProtectedMobileLayout>
          } 
        />

        {/* ======= Planets (both paths resolve) ======= */}
        <Route path="/discover/planets" element={<PlanetsPage />} />
        <Route path="/planets" element={<Navigate to="/discover/planets" replace />} />

        {/* ======= Admin ======= */}
        <Route
          path="/admin/*"
          element={
            <AuthGuard>
              <AdminPage />
            </AuthGuard>
          }
        />

        {/* ======= Legacy / bad routes → dashboard ======= */}
        {/* Old subcategory placeholder or anything else */}
        <Route path="/subcategory/:slug" element={<Navigate to="/dashboard" replace />} />
        <Route path="/training/*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/health/*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/hub/*" element={<Navigate to="/dashboard" replace />} />

        {/* ======= Catch-all ======= */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </Suspense>
  );
}