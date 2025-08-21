import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Paths } from './paths';
import { AdminGuard } from './route-guards/Admin.guard';
import { AuthGuard } from './route-guards/Auth.guard';
import ProtectedMobileLayout from '@/shared/components/layout/ProtectedMobileLayout';

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

// Fitness feature pages
const MobileFitness = lazy(() => import('@/features/health/fitness/pages/Fitness.page'));
const ExercisesPage = lazy(() => import('@/features/health/fitness/pages/Exercises.page'));
const ExerciseEditPage = lazy(() => import('@/features/health/fitness/pages/ExerciseEdit.page'));
const WorkoutSessionPage = lazy(() => import('@/features/health/fitness/pages/WorkoutSession.page'));
const TemplatesPage = lazy(() => import('@/features/health/fitness/pages/Templates.page'));
const TemplateEditorPage = lazy(() => import('@/features/health/fitness/pages/TemplateEditor.page'));
const FitnessConfigurePage = lazy(() => import('@/features/health/fitness/pages/FitnessConfigure.page'));
const HistoryPage = lazy(() => import('@/features/health/fitness/pages/History.page'));
const WorkoutDetailPage = lazy(() => import('@/features/health/fitness/pages/WorkoutDetail.page'));

// Admin pages
const AdminHomePage = lazy(() => import('@/admin/pages/AdminHome.page'));
const AdminExercisesManagement = lazy(() => import('@/admin/pages/AdminExercisesManagement'));
const AdminMusclesManagement = lazy(() => import('@/admin/pages/AdminMusclesManagement'));
const AdminEquipmentManagement = lazy(() => import('@/admin/pages/AdminEquipmentManagement'));
const AdminGripsManagement = lazy(() => import('@/admin/pages/AdminGripsManagement'));
const AdminTranslations = lazy(() => import('@/admin/pages/AdminTranslations'));
const AdminCategoryPage = lazy(() => import('@/admin/pages/AdminCategoryPage'));
const AdminSubcategoryPage = lazy(() => import('@/admin/pages/AdminSubcategoryPage'));

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
              {/* General protected routes */}
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

              {/* Fitness feature routes */}
              <Route path={Paths.health.fitness.root} element={<MobileFitness />} />
              <Route path={Paths.health.fitness.exercises} element={<ExercisesPage />} />
              <Route path={Paths.health.fitness.exerciseEdit()} element={<ExerciseEditPage />} />
              <Route path={Paths.health.fitness.session()} element={<WorkoutSessionPage />} />
              <Route path={Paths.health.fitness.templates} element={<TemplatesPage />} />
              <Route path={Paths.health.fitness.templateEdit()} element={<TemplateEditorPage />} />
              <Route path={Paths.health.fitness.configure} element={<FitnessConfigurePage />} />
              <Route path={Paths.health.fitness.history} element={<HistoryPage />} />
              <Route path={Paths.health.fitness.historyDetail()} element={<WorkoutDetailPage />} />

              {/* Admin routes (all under guard) */}
              <Route element={<AdminGuard />}>
                <Route path={Paths.admin.root} element={<AdminHomePage />} />
                <Route path={Paths.admin.exercises} element={<AdminExercisesManagement />} />
                <Route path={Paths.admin.muscles} element={<AdminMusclesManagement />} />
                <Route path={Paths.admin.equipment} element={<AdminEquipmentManagement />} />
                <Route path={Paths.admin.grips} element={<AdminGripsManagement />} />
                <Route path={`${Paths.admin.translations}/*`} element={<AdminTranslations />} />
                <Route path={Paths.admin.category()} element={<AdminCategoryPage />} />
                <Route path={Paths.admin.subcategory()} element={<AdminSubcategoryPage />} />
              </Route>
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