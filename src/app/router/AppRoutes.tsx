import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Paths } from './paths';
import { AuthGuard } from './route-guards/Auth.guard';
import ProtectedMobileLayout from '@/shared/components/layout/ProtectedMobileLayout';
import { FitnessRoutes } from '@/features/health/fitness';
import { AdminRoutes } from '@/admin';

// Dashboard
const Dashboard = lazy(() => import('@/pages/Dashboard'));

// Public pages
const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Protected pages - General
const UserDashboard = lazy(() => import('@/pages/UserDashboard'));
const Progress = lazy(() => import('@/pages/Progress'));
const Journal = lazy(() => import('@/pages/Journal'));
const Insights = lazy(() => import('@/pages/Insights'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Profile = lazy(() => import('@/pages/Profile'));
const Achievements = lazy(() => import('@/pages/Achievements'));
const AICoachingHub = lazy(() => import('@/pages/AICoachingHub'));
const Social = lazy(() => import('@/pages/Social'));
const AreaDetail = lazy(() => import('@/features/area/AreaDetail'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path={Paths.root} element={<Index />} />
          <Route path={Paths.auth} element={<Auth />} />

          {/* Protected routes wrapper */}
          <Route path="/*" element={
            <ProtectedMobileLayout>
              <Routes>
                {/* Main Dashboard - New unified dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Legacy routes - keeping for compatibility */}
                <Route path={Paths.dashboard} element={<UserDashboard />} />
                <Route path={Paths.progress} element={<Progress />} />
                <Route path={Paths.journal} element={<Journal />} />
                <Route path={Paths.insights} element={<Insights />} />
                <Route path={Paths.analytics} element={<Analytics />} />
                <Route path={Paths.profile} element={<Profile />} />
                <Route path={Paths.achievements} element={<Achievements />} />
                <Route path={Paths.aiCoach} element={<AICoachingHub />} />
                <Route path={Paths.social} element={<Social />} />
                <Route path={Paths.area()} element={<AreaDetail />} />

                {/* Fitness feature routes - delegated to feature */}
                <Route path={`${Paths.health.fitness.root}/*`} element={FitnessRoutes} />

                {/* Admin routes - delegated to admin feature */}
                <Route path={`${Paths.admin.root}/*`} element={<AdminRoutes />} />
              </Routes>
            </ProtectedMobileLayout>
          } />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}