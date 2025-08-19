import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import PageNav from "@/components/PageNav";
import AdminMenu from "@/admin/components/AdminMenu";
import TranslationsMenu from "@/admin/components/TranslationsMenu";
import { useTranslation } from "react-i18next";

const AdminTranslations: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Redirect to categories by default
  if (location.pathname === '/admin/translations') {
    return <Navigate to="/admin/translations/categories" replace />;
  }

  return (
    <main className="container py-6">
      <PageNav current="Admin / Translations" />
      <AdminMenu />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('navigation.translations')}</h1>
        <TranslationsMenu />
        <Outlet />
      </div>
    </main>
  );
};

export default AdminTranslations;