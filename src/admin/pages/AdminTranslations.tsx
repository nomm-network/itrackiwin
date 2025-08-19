import React from "react";
import { Navigate, useLocation } from "react-router-dom";
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
        <h1 className="text-2xl font-bold">{t('admin.translations')}</h1>
        <TranslationsMenu />
        <div className="text-muted-foreground">
          {t('admin.select_translation_type')}
        </div>
      </div>
    </main>
  );
};

export default AdminTranslations;