import { Routes, Route } from "react-router-dom";
import GymsListPage from "./pages/GymsListPage";
import GymDetailPage from "./pages/GymDetailPage";

export function GymRoutes() {
  return (
    <Routes>
      <Route index element={<GymsListPage />} />
      <Route path=":gymId" element={<GymDetailPage />} />
    </Routes>
  );
}