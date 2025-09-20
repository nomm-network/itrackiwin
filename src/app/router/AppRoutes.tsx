import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Paths } from './paths';
import { AuthGuard } from './route-guards/Auth.guard';
import ProtectedMobileLayout from '@/shared/components/layout/ProtectedMobileLayout';
import { AdminRoutes } from '@/admin';

// Dashboard - now using Hub system
const HubPage = lazy(() => import('@/features/hub/HubPage'));

// Public pages
import Index from '@/pages/Index';
const Auth = lazy(() => import('@/pages/Auth'));
const AuthCallback = lazy(() => import('@/pages/auth/callback'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Protected pages - General
const UserDashboard = lazy(() => import('@/pages/UserDashboard'));
const Progress = lazy(() => import('@/pages/Progress'));
const Journal = lazy(() => import('@/pages/Journal'));
const Insights = lazy(() => import('@/pages/Insights'));
const TranslatedProfileDemo = lazy(() => import('@/pages/TranslatedProfileDemo'));
const TranslatedAICoach = lazy(() => import('@/pages/TranslatedAICoach'));
const PersonaSeedingPage = lazy(() => import('@/pages/PersonaSeeding'));
const PersonaDashboard = lazy(() => import('@/pages/PersonaDashboard'));
const ProgramGeneratorTest = lazy(() => import('@/components/test/ProgramGeneratorTest'));
const DataQualityReport = lazy(() => import('@/pages/DataQualityReport'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Profile = lazy(() => import('@/pages/Profile'));
const Achievements = lazy(() => import('@/pages/Achievements'));

const Social = lazy(() => import('@/pages/Social'));
const AreaDetail = lazy(() => import('@/features/area/AreaDetail'));
const CategoryCoachPage = lazy(() => import('@/pages/CategoryCoachPage'));

// Inline component for subcategory redirects (no dynamic import to avoid build issues)
const SubcategoryRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: subcategory, isLoading } = useQuery({
    queryKey: ['subcategory_by_slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('life_subcategories')
        .select(`
          slug,
          life_categories!inner(slug)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  React.useEffect(() => {
    if (subcategory) {
      const categorySlug = subcategory.life_categories.slug;
      navigate(`/dashboard?cat=${categorySlug}&sub=${slug}`, { replace: true });
    }
  }, [subcategory, slug, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
};

const OrbitPlanetsPage = lazy(() => import('@/features/planets/OrbitPlanetsPage'));
const AtlasPage = lazy(() => import('@/features/planets/AtlasPage'));
const MentorsPage = lazy(() => import('@/pages/MentorsPage'));
const GymsListPage = lazy(() => import('@/features/gyms/pages/GymsListPage'));

// Ambassador and Marketplace
const GymAdminPage = lazy(() => import('@/features/gyms/admin/GymAdminPage'));
const MarketplacePage = lazy(() => import('@/features/marketplace/MarketplacePage'));
const GymPublicPage = lazy(() => import('@/features/marketplace/GymPublicPage'));
const RequireGymAdmin = lazy(() => import('@/components/guards/RequireGymAdmin'));
const SafeAdminGuard = lazy(() => import('@/components/guards/SafeAdminGuard'));
const MentorPublicPage = lazy(() => import('@/features/marketplace/MentorPublicPage'));
const AmbassadorPanelPage = lazy(() => import('@/features/ambassador/pages/AmbassadorPanelPage'));

const BroAICoach = lazy(() => import('@/pages/BroAICoach'));
const TestDynamicNav = lazy(() => import('@/pages/TestDynamicNav'));

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
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Settings route */}
          <Route path="/settings" element={
            <ProtectedMobileLayout>
              <Settings />
            </ProtectedMobileLayout>
          } />

          {/* Planets/Atlas page for authenticated users */}
          <Route path="/planets" element={
            <ProtectedMobileLayout>
              <OrbitPlanetsPage />
            </ProtectedMobileLayout>
          } />
          <Route path="/atlas" element={
            <ProtectedMobileLayout>
              <AtlasPage />
            </ProtectedMobileLayout>
          } />
          <Route path="/explore" element={
            <ProtectedMobileLayout>
              <OrbitPlanetsPage />
            </ProtectedMobileLayout>
          } />

          {/* Main Dashboard - now hub-driven */}
          <Route path="/dashboard" element={
            <ProtectedMobileLayout>
              <HubPage />
            </ProtectedMobileLayout>
          } />
          
          <Route path="/user-dashboard" element={
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
          <Route path={Paths.social} element={
            <ProtectedMobileLayout>
              <Social />
            </ProtectedMobileLayout>
          } />
          <Route path={Paths.area()} element={
            <ProtectedMobileLayout>
              <CategoryCoachPage />
            </ProtectedMobileLayout>
          } />
          <Route path="/subcategory/:slug" element={
            <ProtectedMobileLayout>
              <SubcategoryRedirect />
            </ProtectedMobileLayout>
          } />
          <Route path="/mentors" element={
            <ProtectedMobileLayout>
              <MentorsPage />
            </ProtectedMobileLayout>
          } />
          <Route path="/gyms" element={
            <ProtectedMobileLayout>
              <GymsListPage />
            </ProtectedMobileLayout>
          } />
          <Route path="/gyms/:gymId" element={
            <ProtectedMobileLayout>
              <GymsListPage />
            </ProtectedMobileLayout>
          } />

          {/* Ambassador and User Routes */}
          <Route path="/ambassador" element={
            <ProtectedMobileLayout>
              <AmbassadorPanelPage />
            </ProtectedMobileLayout>
          } />
          <Route path="/gyms/:gymId/admin" element={
            <ProtectedMobileLayout>
              <GymAdminPage />
            </ProtectedMobileLayout>
          } />

          {/* Public Marketplace Routes */}
          <Route path="/marketplace" element={
            <ProtectedMobileLayout>
              <MarketplacePage />
            </ProtectedMobileLayout>
          } />
          <Route path="/g/:slug" element={
            <ProtectedMobileLayout>
              <GymPublicPage />
            </ProtectedMobileLayout>
          } />
          <Route path="/m/:slugOrId" element={
            <ProtectedMobileLayout>
              <MentorPublicPage />
            </ProtectedMobileLayout>
          } />

          {/* Demo and Development Routes */}
          <Route path="/translated-profile-demo" element={<TranslatedProfileDemo />} />
          <Route path="/translated-ai-coach" element={<TranslatedAICoach />} />
          <Route path="/persona-seeding" element={<PersonaSeedingPage />} />
          <Route path="/persona-dashboard" element={<PersonaDashboard />} />
          <Route path="/program-test" element={<ProgramGeneratorTest />} />
          <Route path="/data-quality-report" element={<DataQualityReport />} />
          <Route path="/test-dynamic-nav" element={
            <ProtectedMobileLayout>
              <TestDynamicNav />
            </ProtectedMobileLayout>
          } />
          
          {/* Bro AI Coach */}
          <Route path="/bro-ai-coach" element={
            <ProtectedMobileLayout>
              <BroAICoach />
            </ProtectedMobileLayout>
          } />

          {/* Admin routes - without mobile layout for better admin experience */}
          <Route path={`${Paths.admin.root}/*`} element={<AdminRoutes />} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}