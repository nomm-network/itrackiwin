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
import Profile from "./pages/Profile";
import AreaDetail from "./features/area/AreaDetail";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Fitness from "./pages/Fitness";
import WorkoutSession from "./pages/WorkoutSession";
import Templates from "./pages/Templates";
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
import UserDashboard from "./pages/UserDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Index />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/area/:slug" element={<AreaDetail />} />
            {/* Fitness routes */}
            <Route path="/fitness" element={<Fitness />} />
            <Route path="/fitness/exercises" element={<Exercises />} />
            <Route path="/fitness/exercises/add" element={<ExerciseAdd />} />
            <Route path="/fitness/exercises/:id/edit" element={<ExerciseEdit />} />
            <Route path="/fitness/session/:id" element={<WorkoutSession />} />
            <Route path="/fitness/templates" element={<Templates />} />
            <Route path="/fitness/configure" element={<FitnessConfigure />} />
            <Route path="/fitness/history" element={<History />} />
            <Route path="/fitness/history/:id" element={<WorkoutDetail />} />

            {/* User Dashboard */}
            <Route path="/dashboard" element={<UserDashboard />} />

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/translations" element={<AdminTranslations />} />
              <Route path="/admin/translations/categories" element={<AdminCategoriesTranslations />} />
              <Route path="/admin/translations/subcategories" element={<AdminSubcategoriesTranslations />} />
              <Route path="/admin/translations/exercises" element={<AdminExercisesTranslations />} />
              <Route path="/admin/category/:categoryId" element={<AdminCategoryPage />} />
              <Route path="/admin/category/:categoryId/sub/:subcategoryId" element={<AdminSubcategoryPage />} />
            </Route>
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
