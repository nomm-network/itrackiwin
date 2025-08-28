import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminGuard } from "@/app/router/route-guards/Admin.guard";
import AdminLayout from "./layout/AdminLayout";

const AdminHomePage = lazy(() => import("./pages/AdminHome.page"));
const AdminExercisesManagement = lazy(() => import("./pages/AdminExercisesManagement"));
const AdminMusclesManagement = lazy(() => import("./pages/AdminMusclesManagement"));
const AdminEquipmentManagement = lazy(() => import("./pages/AdminEquipmentManagement"));
const AdminGripsManagement = lazy(() => import("./pages/AdminGripsManagement"));
const AdminGymsManagement = lazy(() => import("./pages/AdminGymsManagement"));
const AdminTranslations = lazy(() => import("./pages/AdminTranslations"));
const AdminCategoryPage = lazy(() => import("./pages/AdminCategoryPage"));
const AdminSubcategoryPage = lazy(() => import("./pages/AdminSubcategoryPage"));
const AdminCoachLogs = lazy(() => import("./pages/AdminCoachLogs"));
const AdminAttributeSchemas = lazy(() => import("./pages/AdminAttributeSchemas"));
const AdminNamingTemplates = lazy(() => import("./pages/AdminNamingTemplates"));
// Reuse the fitness exercise add page for admin
const ExerciseAdd = lazy(() => import("@/features/health/fitness/pages/ExerciseAdd.page"));

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminGuard />}>
        <Route path="/*" element={
          <AdminLayout>
            <Routes>
              <Route index element={<AdminHomePage />} />
              <Route path="exercises" element={<AdminExercisesManagement />} />
              <Route path="exercises/add" element={<ExerciseAdd />} />
              <Route path="attribute-schemas" element={<AdminAttributeSchemas />} />
              <Route path="naming-templates" element={<AdminNamingTemplates />} />
              <Route path="muscles" element={<AdminMusclesManagement />} />
              <Route path="others/equipment" element={<AdminEquipmentManagement />} />
              <Route path="others/grips" element={<AdminGripsManagement />} />
              <Route path="others/gyms" element={<AdminGymsManagement />} />
              <Route path="translations/*" element={<AdminTranslations />} />
              <Route path="coach-logs" element={<AdminCoachLogs />} />
              <Route path="category/:categoryId" element={<AdminCategoryPage />} />
              <Route path="category/:categoryId/sub/:subcategoryId" element={<AdminSubcategoryPage />} />
            </Routes>
          </AdminLayout>
        } />
      </Route>
    </Routes>
  );
}