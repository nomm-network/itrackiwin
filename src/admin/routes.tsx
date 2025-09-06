import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { SafeAdminGuard } from "@/components/guards/SafeAdminGuard";
import { SimpleErrorBoundary } from "@/components/util/SimpleErrorBoundary";
import AdminLayout from "./layout/AdminLayout";

const AdminHomePage = lazy(() => import("./pages/AdminHome.page"));
const AdminExercisesManagement = lazy(() => import("./pages/AdminExercisesManagement"));
const AdminExerciseEdit = lazy(() => import("./pages/AdminExerciseEdit.tsx"));
const AdminMusclesManagement = lazy(() => import("./pages/AdminMusclesManagement"));
const AdminEquipmentManagement = lazy(() => import("./pages/AdminEquipmentManagement"));
const AdminGripsManagement = lazy(() => import("./pages/AdminGripsManagement"));
const AdminMovementsManagement = lazy(() => import("./pages/AdminMovementsManagement"));
const AdminEquipmentGripCompatibility = lazy(() => import("./pages/AdminEquipmentGripCompatibility"));
const AdminTemporaryDisabled = lazy(() => import("./pages/AdminTemporaryDisabled"));
const AdminTagsAliasesManagement = lazy(() => import("./pages/AdminTagsAliasesManagement"));
const AdminGymsManagement = lazy(() => import("./pages/AdminGymsManagement"));
const AdminTranslations = lazy(() => import("./pages/AdminTranslations"));
const AdminCategoryPage = lazy(() => import("./pages/AdminCategoryPage"));
const AdminSubcategoryPage = lazy(() => import("./pages/AdminSubcategoryPage"));
const AdminCoachLogs = lazy(() => import("./pages/AdminCoachLogs"));
const AdminAttributeSchemas = lazy(() => import("./pages/AdminAttributeSchemas"));
const AdminNamingTemplates = lazy(() => import("./pages/AdminNamingTemplates"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));

const AdminUsersListPage = lazy(() => import("./users/AdminUsersListPage"));
const AdminUserDetailPage = lazy(() => import("./users/AdminUserDetailPage"));
const AdminMentorsListPage = lazy(() => import("@/features/mentors/admin/AdminMentorsListPage"));
const HelloTestPage = lazy(() => import("@/features/mentors/admin/HelloTestPage"));

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/*" element={
        <div style={{ padding: "24px", backgroundColor: "lightgreen" }}>
          <h1>🔧 BASIC ADMIN SHELL TEST</h1>
          <p>If you see this green box, the basic admin route is working!</p>
          <AdminLayout>
              <Routes>
                <Route index element={<AdminHomePage />} />
                <Route path="exercises" element={<AdminExercisesManagement />} />
                <Route path="exercises/:id/edit" element={<AdminExerciseEdit />} />
                <Route path="users" element={<AdminUsersListPage />} />
                <Route path="users/:id" element={<AdminUserDetailPage />} />
                <Route path="mentors" element={<HelloTestPage />} />
                <Route path="mentors/new" element={<HelloTestPage />} />
                <Route path="mentors/:id" element={<HelloTestPage />} />
                
                {/* Setup Flow Routes */}
                <Route path="setup/body-taxonomy" element={<AdminMusclesManagement />} />
                <Route path="setup/equipment" element={<AdminEquipmentManagement />} />
                <Route path="setup/grips" element={<AdminGripsManagement />} />
                <Route path="setup/equipment-grip-compatibility" element={<AdminEquipmentGripCompatibility />} />
                <Route path="setup/movement-patterns" element={<AdminMovementsManagement />} />
                <Route path="setup/tags-aliases" element={<AdminTagsAliasesManagement />} />
                
                {/* Legacy routes for backwards compatibility */}
                <Route path="muscles" element={<AdminMusclesManagement />} />
                <Route path="others/equipment" element={<AdminEquipmentManagement />} />
                <Route path="others/grips" element={<AdminGripsManagement />} />
                <Route path="others/gyms" element={<AdminGymsManagement />} />
                
                <Route path="attribute-schemas" element={<AdminAttributeSchemas />} />
                <Route path="naming-templates" element={<AdminNamingTemplates />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="translations/*" element={<AdminTranslations />} />
                <Route path="coach-logs" element={<AdminCoachLogs />} />
                <Route path="category/:categoryId" element={<AdminCategoryPage />} />
                <Route path="category/:categoryId/sub/:subcategoryId" element={<AdminSubcategoryPage />} />
              </Routes>
            </AdminLayout>
          </div>
        
      } />
    </Routes>
  );
}