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

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminGuard />}>
        <Route path="/*" element={
          <AdminLayout>
            <Routes>
              <Route index element={<AdminHomePage />} />
              <Route path="exercises" element={<AdminExercisesManagement />} />
              <Route path="muscles" element={<AdminMusclesManagement />} />
              <Route path="others/equipment" element={<AdminEquipmentManagement />} />
              <Route path="others/grips" element={<AdminGripsManagement />} />
              <Route path="others/gyms" element={<AdminGymsManagement />} />
              <Route path="translations/*" element={<AdminTranslations />} />
              <Route path="category/:categoryId" element={<AdminCategoryPage />} />
              <Route path="category/:categoryId/sub/:subcategoryId" element={<AdminSubcategoryPage />} />
            </Routes>
          </AdminLayout>
        } />
      </Route>
    </Routes>
  );
}