import { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const FitnessPage = lazy(() => import("./pages/Fitness.page"));
const ExercisesPage = lazy(() => import("./pages/Exercises.page"));
// const WorkoutSessionPage = lazy(() => import("./pages/old-WorkoutSession.page")); // UNUSED - actual route uses /app/workouts/workout-detail.tsx
const TemplatesPage = lazy(() => import("./pages/Templates.page"));
const TemplateEditPage = lazy(() => import("./pages/TemplateEdit.page"));
// const WorkoutSessionP = lazy(() => import("./pages/old-WorkoutSession.page")); // DUPLICATE/UNUSED
const HistoryPage = lazy(() => import("./pages/History.page"));
const WorkoutDetailPage = lazy(() => import("./pages/WorkoutDetail.page"));

const MyGymPage = lazy(() => import("./pages/MyGym.page"));
const TemplateRotationPage = lazy(() => import("./pages/TemplateRotation.page"));
const FitnessProfilePage = lazy(() => import("./components/FitnessProfile"));
const TrainingProgramsPage = lazy(() => import("../../../pages/TrainingPrograms"));

export const FitnessRoutes = (
  <Routes>
    <Route index element={<FitnessPage />} />
    <Route path="exercises" element={<ExercisesPage />} />
    {/* <Route path="session/:id" element={<WorkoutSessionPage />} /> */} {/* UNUSED - actual route is /app/workouts/:workoutId */}
    <Route path="templates" element={<TemplatesPage />} />
    <Route path="templates/:templateId/edit" element={<TemplateEditPage />} />
    
    
    <Route path="my-gym" element={<MyGymPage />} />
    <Route path="programs" element={<TrainingProgramsPage />} />
    <Route path="templates/rotation" element={<TemplateRotationPage />} />
    <Route path="profile" element={<FitnessProfilePage />} />
    <Route path="history" element={<HistoryPage />} />
    <Route path="history/:id" element={<WorkoutDetailPage />} />
  </Routes>
);