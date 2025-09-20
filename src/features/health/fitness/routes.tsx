import { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const FitnessPage = lazy(() => import("./pages/Fitness.page"));
const ExercisesPage = lazy(() => import("./pages/Exercises.page"));
const WorkoutSessionContainer = lazy(() => import("../../workouts/session/WorkoutSessionContainer"));
const TemplatesPage = lazy(() => import("./pages/Templates.page"));
const TemplateEditPage = lazy(() => import("./pages/TemplateEdit.page"));
const WorkoutSessionP = lazy(() => import("./pages/WorkoutSession.page"));
const HistoryPage = lazy(() => import("./pages/History.page"));
const WorkoutDetailPage = lazy(() => import("./pages/WorkoutDetail.page"));

const MyGymPage = lazy(() => import("./pages/MyGym.page"));
const TemplateRotationPage = lazy(() => import("./pages/TemplateRotation.page"));
// FitnessProfile component removed - using HealthConfigureBody instead
const TrainingProgramsPage = lazy(() => import("../../../pages/TrainingPrograms"));

export const FitnessRoutes = (
  <Routes>
    <Route index element={<FitnessPage />} />
    <Route path="exercises" element={<ExercisesPage />} />
    <Route path="session/:id" element={<WorkoutSessionContainer />} />
    <Route path="templates" element={<TemplatesPage />} />
    <Route path="templates/:templateId/edit" element={<TemplateEditPage />} />
    
    
    <Route path="my-gym" element={<MyGymPage />} />
    <Route path="programs" element={<TrainingProgramsPage />} />
    <Route path="templates/rotation" element={<TemplateRotationPage />} />
    {/* FitnessProfile route removed - using HealthConfigureBody instead */}
    <Route path="history" element={<HistoryPage />} />
    <Route path="history/:id" element={<WorkoutDetailPage />} />
  </Routes>
);