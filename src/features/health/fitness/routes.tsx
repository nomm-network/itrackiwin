import { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const FitnessPage = lazy(() => import("./pages/Fitness.page"));
const ExercisesPage = lazy(() => import("./pages/Exercises.page"));
const TemplatesPage = lazy(() => import("./pages/Templates.page"));
const TemplateEditPage = lazy(() => import("./pages/TemplateEdit.page"));
const HistoryPage = lazy(() => import("./pages/History.page"));
const FitnessConfigurePage = lazy(() => import("./pages/FitnessConfigure.page"));
const MyGymPage = lazy(() => import("./pages/MyGym.page"));
const FitnessProfilePage = lazy(() => import("./components/FitnessProfile"));
const LazyTrainingPrograms = lazy(() => import('./pages/TrainingPrograms.page'));
// Re-use WorkoutPage for workout detail view
const WorkoutDetailPage = lazy(() => import("./workouts/WorkoutPage"));

export const FitnessRoutes = (
  <Routes>
    <Route index element={<FitnessPage />} />
    <Route path="exercises" element={<ExercisesPage />} />
    {/* <Route path="session/:id" element={<WorkoutSessionPage />} /> REMOVED */}
    <Route path="templates" element={<TemplatesPage />} />
    <Route path="templates/:templateId/edit" element={<TemplateEditPage />} />
    
    <Route path="configure" element={<FitnessConfigurePage />} />
    <Route path="my-gym" element={<MyGymPage />} />
    <Route path="programs" element={<LazyTrainingPrograms />} />
    {/* <Route path="templates/rotation" element={<TemplateRotationPage />} /> REMOVED */}
    <Route path="profile" element={<FitnessProfilePage />} />
    <Route path="history" element={<HistoryPage />} />
    <Route path="history/:id" element={<WorkoutDetailPage />} />
  </Routes>
);