import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminGuard } from "@/app/router/route-guards/Admin.guard";
import AdminLayout from "./layout/AdminLayout";

const AdminHomePage = lazy(() => import("./pages/AdminHome.page"));
const AdminExercisesManagement = lazy(() => import("./pages/AdminExercisesManagement"));
const AdminExerciseEdit = lazy(() => import("./pages/AdminExerciseEdit"));
const AdminMusclesManagement = lazy(() => import("./pages/AdminMusclesManagement"));
const AdminEquipmentManagement = lazy(() => import("./pages/AdminEquipmentManagement"));
const AdminGripsManagement = lazy(() => import("./pages/AdminGripsManagement"));
const AdminHandlesManagement = lazy(() => import("./pages/AdminHandlesManagement"));
const AdminMovementsManagement = lazy(() => import("./pages/AdminMovementsManagement"));
const AdminHandleEquipmentCompatibility = lazy(() => import("./pages/AdminHandleEquipmentCompatibility"));
const AdminHandleGripCompatibility = lazy(() => import("./pages/AdminHandleGripCompatibility"));
const AdminCompatibilityManagement = lazy(() => import("./pages/AdminCompatibilityManagement"));
const AdminTagsAliasesManagement = lazy(() => import("./pages/AdminTagsAliasesManagement"));
const AdminGymsManagement = lazy(() => import("./pages/AdminGymsManagement"));
const AdminTranslations = lazy(() => import("./pages/AdminTranslations"));
const AdminCategoryPage = lazy(() => import("./pages/AdminCategoryPage"));
const AdminSubcategoryPage = lazy(() => import("./pages/AdminSubcategoryPage"));
const AdminCoachLogs = lazy(() => import("./pages/AdminCoachLogs"));
const AdminAttributeSchemas = lazy(() => import("./pages/AdminAttributeSchemas"));
const AdminNamingTemplates = lazy(() => import("./pages/AdminNamingTemplates"));

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminGuard />}>
        <Route path="/*" element={
          <AdminLayout>
            <Routes>
              <Route index element={<AdminHomePage />} />
              <Route path="exercises" element={<AdminExercisesManagement />} />
              <Route path="exercises/:id/edit" element={<AdminExerciseEdit />} />
              
              {/* Setup Flow Routes */}
              <Route path="setup/body-taxonomy" element={<AdminMusclesManagement />} />
              <Route path="setup/equipment" element={<AdminEquipmentManagement />} />
              <Route path="setup/handles" element={<AdminHandlesManagement />} />
              <Route path="setup/grips" element={<AdminGripsManagement />} />
              <Route path="setup/handle-equipment-compatibility" element={<AdminHandleEquipmentCompatibility />} />
              <Route path="setup/handle-grip-compatibility" element={<AdminHandleGripCompatibility />} />
              <Route path="setup/compatibility" element={<AdminCompatibilityManagement />} />
              <Route path="setup/movement-patterns" element={<AdminMovementsManagement />} />
              <Route path="setup/tags-aliases" element={<AdminTagsAliasesManagement />} />
              
              {/* Legacy routes for backwards compatibility */}
              <Route path="muscles" element={<AdminMusclesManagement />} />
              <Route path="others/equipment" element={<AdminEquipmentManagement />} />
              <Route path="others/grips" element={<AdminGripsManagement />} />
              <Route path="others/gyms" element={<AdminGymsManagement />} />
              
              <Route path="attribute-schemas" element={<AdminAttributeSchemas />} />
              <Route path="naming-templates" element={<AdminNamingTemplates />} />
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