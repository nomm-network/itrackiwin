import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Paths } from './paths';
import { AuthGuard } from './route-guards/Auth.guard';
import ProtectedMobileLayout from '@/shared/components/layout/ProtectedMobileLayout';
import { FitnessRoutes } from '@/features/health/fitness';
import { AdminRoutes } from '@/admin';
import WorkoutsLayout from '@/features/workouts/WorkoutsLayout';
import StartOrContinue from '@/features/workouts/components/StartOrContinue';

// Dashboard
const Dashboard = lazy(() => import('@/pages/Dashboard'));

// Public pages
const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Onboarding pages
const Onboarding = lazy(() => import('@/features/health/fitness/pages/onboarding/Onboarding.page'));

// Protected pages - General
const UserDashboard = lazy(() => import('@/pages/UserDashboard'));
const Progress = lazy(() => import('@/pages/Progress'));
const Journal = lazy(() => import('@/pages/Journal'));
const Insights = lazy(() => import('@/pages/Insights'));
const TranslatedProfileDemo = lazy(() => import('@/pages/TranslatedProfileDemo'));
const TranslatedAICoach = lazy(() => import('@/pages/TranslatedAICoach'));
const MobilePolishDemo = lazy(() => import('@/pages/MobilePolishDemo'));
const PersonaSeedingPage = lazy(() => import('@/pages/PersonaSeeding'));
const PersonaDashboard = lazy(() => import('@/pages/PersonaDashboard'));
const SafeguardTesting = lazy(() => import('@/pages/SafeguardTesting'));
const SessionRunnerDemo = lazy(() => import('@/pages/SessionRunnerDemo'));
const PRAnnouncementDemo = lazy(() => import('@/pages/PRAnnouncementDemo'));
const DataQualityReport = lazy(() => import('@/pages/DataQualityReport'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Profile = lazy(() => import('@/pages/Profile'));
const Achievements = lazy(() => import('@/pages/Achievements'));
const AICoachingHub = lazy(() => import('@/pages/AICoachingHub'));
const Social = lazy(() => import('@/pages/Social'));
const AreaDetail = lazy(() => import('@/features/area/AreaDetail'));
const Orbits = lazy(() => import('@/pages/Orbits'));

// Fitness & Programs
const LazyProgramsPage = lazy(() => import('@/app/programs/page'));
const LazyStartQuickWorkout = lazy(() => import('@/app/workouts/start-quick/page'));
const LazyWorkoutPage = lazy(() => import('@/app/workouts/[workoutId]/page'));

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
          
          {/* Onboarding routes */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Public orbits page for authenticated users */}
          <Route path="/explore" element={
            <ProtectedMobileLayout>
              <Orbits />
            </ProtectedMobileLayout>
          } />

          {/* Main Dashboard - New unified dashboard */}
          <Route path="/dashboard" element={
            <ProtectedMobileLayout>
              <Dashboard />
            </ProtectedMobileLayout>
          } />

          {/* Protected routes */}
          <Route path={Paths.dashboard} element={
            <ProtectedMobileLayout>
              <UserDashboard />
            </ProtectedMobileLayout>
          } />
          <Route path={Paths.progress} element={
            <ProtectedMobileLayout>
              <Progress />
            </ProtectedMobileLayout>
          } />
          <Route path={Paths.journal} element={
            <ProtectedMobileLayout>
              <Journal />
            </ProtectedMobileLayout>
          } />
          <Route path={Paths.insights} element={
            <ProtectedMobileLayout>
              <Insights />
            </ProtectedMobileLayout>
          } />
          <Route path={Paths.analytics} element={
            <ProtectedMobileLayout>
              <Analytics />
            </ProtectedMobileLayout>
          } />
          <Route path={Paths.profile} element={
            <ProtectedMobileLayout>
              <Profile />
            </ProtectedMobileLayout>
          } />
          <Route path={Paths.achievements} element={
            <ProtectedMobileLayout>
              <Achievements />
            </ProtectedMobileLayout>
          } />
          <Route path={Paths.aiCoach} element={
            <ProtectedMobileLayout>
              <AICoachingHub />
            </ProtectedMobileLayout>
          } />
          <Route path={Paths.social} element={
            <ProtectedMobileLayout>
              <Social />
            </ProtectedMobileLayout>
          } />
          <Route path={Paths.area()} element={
            <ProtectedMobileLayout>
              <AreaDetail />
            </ProtectedMobileLayout>
          } />

          {/* Demo and Development Routes */}
          <Route path="/translated-profile-demo" element={<TranslatedProfileDemo />} />
          <Route path="/translated-ai-coach" element={<TranslatedAICoach />} />
          <Route path="/mobile-polish-demo" element={<MobilePolishDemo />} />
          <Route path="/persona-seeding" element={<PersonaSeedingPage />} />
          <Route path="/persona-dashboard" element={<PersonaDashboard />} />
        <Route path="/safeguard-testing" element={<SafeguardTesting />} />
        <Route path="/session-runner-demo" element={<SessionRunnerDemo />} />
        <Route path="/pr-announcement-demo" element={<PRAnnouncementDemo />} />
        <Route path="/data-quality-report" element={<DataQualityReport />} />

          {/* Redirect fitness to dashboard */}
          <Route path={Paths.health.fitness.root} element={
            <Navigate to={Paths.dashboard} replace />
          } />
          
          {/* Training Programs */}
          <Route path="/app/programs" element={
            <ProtectedMobileLayout>
              <LazyProgramsPage />
            </ProtectedMobileLayout>
          } />

          {/* Workout Routes with Layout */}
          <Route path="/app/workouts" element={
            <ProtectedMobileLayout>
              <WorkoutsLayout />
            </ProtectedMobileLayout>
          }>
            <Route index element={<StartOrContinue />} />
            <Route path=":workoutId" element={<LazyWorkoutPage />} />
          </Route>

          {/* Fitness sub-routes still work for admin/configuration */}
          <Route path={`${Paths.health.fitness.root}/*`} element={
            <ProtectedMobileLayout>
              {FitnessRoutes}
            </ProtectedMobileLayout>
          } />

          {/* Admin routes - delegated to admin feature */}
          <Route path={`${Paths.admin.root}/*`} element={
            <ProtectedMobileLayout>
              <AdminRoutes />
            </ProtectedMobileLayout>
          } />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}