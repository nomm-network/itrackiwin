import { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const FitnessPage = lazy(() => import("./pages/Fitness.page"));
const ExercisesPage = lazy(() => import("./pages/Exercises.page"));
const ExerciseEditPage = lazy(() => import("./pages/ExerciseEdit.page"));
const WorkoutSessionPage = lazy(() => import("./pages/WorkoutSession.page"));
const TemplatesPage = lazy(() => import("./pages/Templates.page"));
const TemplateEditorPage = lazy(() => import("./pages/TemplateEditor.page"));
const HistoryPage = lazy(() => import("./pages/History.page"));
const WorkoutDetailPage = lazy(() => import("./pages/WorkoutDetail.page"));

const MyGymPage = lazy(() => import("./pages/MyGym.page"));
const TemplateRotationPage = lazy(() => import("./pages/TemplateRotation.page"));

export const FitnessRoutes = (
  <Routes>
    <Route index element={<FitnessPage />} />
    <Route path="exercises" element={<ExercisesPage />} />
    <Route path="exercises/:id/edit" element={<ExerciseEditPage />} />
    <Route path="session/:id" element={<WorkoutSessionPage />} />
    <Route path="templates" element={<TemplatesPage />} />
    <Route path="templates/:templateId/edit" element={<TemplateEditorPage />} />
    
    <Route path="my-gym" element={<MyGymPage />} />
    <Route path="templates/rotation" element={<TemplateRotationPage />} />
    <Route path="history" element={<HistoryPage />} />
    <Route path="history/:id" element={<WorkoutDetailPage />} />
  </Routes>
);