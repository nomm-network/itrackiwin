import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageNav from "@/components/PageNav";
import { useTranslation } from "react-i18next";
import AdminMenu from "@/admin/components/AdminMenu";
import AdminHeaderMenu from "@/admin/components/AdminHeaderMenu";
import { useTranslations } from "@/hooks/useTranslations";

const AdminHome: React.FC = () => {
  const { t } = useTranslation();
  const { getTranslatedName, currentLanguage } = useTranslations();
  
  const { data: categories = [] } = useQuery({
    queryKey: ["admin_categories_list", currentLanguage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_categories_with_translations")
        .select("id, slug, translations")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Array<{ 
        id: string; 
        slug: string | null; 
        translations: Record<string, { name: string; description?: string }> | null;
      }>;
    },
  });

  return (
    <main className="container py-6">
      <PageNav current="Admin" />
      <AdminMenu />
      <AdminHeaderMenu />
      <h1 className="sr-only">Admin</h1>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('admin.categories')}</h2>
        <nav className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.id} to={`/admin/category/${c.id}`} className="rounded-md border border-border bg-card p-3 hover:bg-accent transition-colors">
              {getTranslatedName(c)}
            </Link>
          ))}
          {categories.length === 0 && (
            <p className="text-muted-foreground">{t('admin.no_categories')}</p>
          )}
        </nav>
      </section>
    </main>
  );
};

export default AdminHome;
