import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Progress from "./pages/Progress";
import Journal from "./pages/Journal";
import Insights from "./pages/Insights";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import AreaDetail from "./features/area/AreaDetail";
import Auth from "./pages/Auth";
import ProtectedMobileLayout from "./components/layout/ProtectedMobileLayout";
import Fitness from "./pages/Fitness";
import MobileFitness from "./pages/MobileFitness";
import WorkoutSession from "./pages/WorkoutSession";
import Templates from "./pages/Templates";
import TemplateEditor from "./pages/TemplateEditor";
import History from "./pages/History";
import WorkoutDetail from "./pages/WorkoutDetail";
import Exercises from "./pages/Exercises";
import FitnessConfigure from "./pages/FitnessConfigure";
import ExerciseAdd from "./pages/ExerciseAdd";
import ExerciseEdit from "./pages/ExerciseEdit";
import AdminRoute from "./components/auth/AdminRoute";
import AdminHome from "./admin/pages/AdminHome";
import AdminCategoryPage from "./admin/pages/AdminCategoryPage";
import AdminSubcategoryPage from "./admin/pages/AdminSubcategoryPage";
import AdminTranslations from "./admin/pages/AdminTranslations";
import AdminCategoriesTranslations from "./admin/pages/AdminCategoriesTranslations";
import AdminSubcategoriesTranslations from "./admin/pages/AdminSubcategoriesTranslations";
import AdminExercisesTranslations from "./admin/pages/AdminExercisesTranslations";
import AdminMusclesTranslations from "./admin/pages/AdminMusclesTranslations";
import AdminExercisesManagement from "./admin/pages/AdminExercisesManagement";
import AdminMusclesManagement from "./admin/pages/AdminMusclesManagement";
import AdminEquipmentManagement from "./admin/pages/AdminEquipmentManagement";
import AdminGripsManagement from "./admin/pages/AdminGripsManagement";
import AdminEquipmentTranslations from "./admin/pages/AdminEquipmentTranslations";
import AdminGripsTranslations from "./admin/pages/AdminGripsTranslations";
import AICoachingHub from "./pages/AICoachingHub";
import Social from "./pages/Social";
import UserDashboard from "./pages/UserDashboard";
import Achievements from "./pages/Achievements";
import { useIsMobile } from "./hooks/useMobile";

const queryClient = new QueryClient();

const App = () => {
  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registered'))
        .catch(() => console.log('SW registration failed'));
    });
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedMobileLayout>
                <Routes>
                  <Route path="/ai-coach" element={<AICoachingHub />} />
                  <Route path="/social" element={<Social />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/area/:slug" element={<AreaDetail />} />
                  {/* Fitness routes - mobile-optimized */}
                  <Route path="/fitness" element={<MobileFitness />} />
                  <Route path="/fitness/exercises" element={<Exercises />} />
                  <Route path="/fitness/exercises/:id/edit" element={<ExerciseEdit />} />
                  <Route path="/fitness/session/:id" element={<WorkoutSession />} />
                  <Route path="/fitness/templates" element={<Templates />} />
                  <Route path="/fitness/templates/:templateId/edit" element={<TemplateEditor />} />
                  <Route path="/fitness/configure" element={<FitnessConfigure />} />
                  <Route path="/fitness/history" element={<History />} />
                  <Route path="/fitness/history/:id" element={<WorkoutDetail />} />
                  {/* User Dashboard */}
                  <Route path="/dashboard" element={<UserDashboard />} />
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminHome />} />
                  <Route path="/admin/exercises" element={<AdminExercisesManagement />} />
                  <Route path="/admin/muscles" element={<AdminMusclesManagement />} />
                  <Route path="/admin/others/equipment" element={<AdminEquipmentManagement />} />
                  <Route path="/admin/others/grips" element={<AdminGripsManagement />} />
                  <Route path="/admin/translations/*" element={<AdminTranslations />} />
                  <Route path="/admin/category/:categoryId" element={<AdminCategoryPage />} />
                  <Route path="/admin/category/:categoryId/sub/:subcategoryId" element={<AdminSubcategoryPage />} />
                </Routes>
              </ProtectedMobileLayout>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
