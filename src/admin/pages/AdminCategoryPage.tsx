import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageNav from "@/components/PageNav";
import { useTranslation } from "react-i18next";
import AdminHeaderMenu from "@/admin/components/AdminHeaderMenu";
import AdminSubcategoryMenu from "@/admin/components/AdminSubcategoryMenu";
import { useTranslations } from "@/hooks/useTranslations";

const AdminCategoryPage: React.FC = () => {
  const { categoryId } = useParams();
  const { t } = useTranslation();
  const { getTranslatedName, currentLanguage } = useTranslations();

  const { data: category } = useQuery({
    queryKey: ["admin_category", categoryId, currentLanguage],
    queryFn: async () => {
      if (!categoryId) return null;
      const { data, error } = await supabase
        .from("v_categories_with_translations")
        .select("id, slug, translations, fallback_name")
        .eq("id", categoryId)
        .single();
      if (error) throw error;
      return data as { 
        id: string; 
        slug: string | null; 
        translations: Record<string, { name: string; description?: string }> | null;
        fallback_name: string;
      };
    },
    enabled: !!categoryId,
  });

  const { data: subcategories = [] } = useQuery({
    queryKey: ["admin_subcategories", categoryId, currentLanguage],
    queryFn: async () => {
      if (!categoryId) return [];
      const { data, error } = await supabase
        .from("v_subcategories_with_translations")
        .select("id, slug, translations, fallback_name")
        .eq("category_id", categoryId)
        .order("display_order", { ascending: true })
        .order("fallback_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Array<{ 
        id: string; 
        slug: string | null; 
        translations: Record<string, { name: string; description?: string }> | null;
        fallback_name: string;
      }>;
    },
    enabled: !!categoryId,
  });

  return (
    <main className="container py-6">
      <PageNav current={`Admin / ${category ? getTranslatedName(category) : "Category"}`} />
      <AdminHeaderMenu />
      <h1 className="sr-only">Admin Category: {category ? getTranslatedName(category) : "Category"}</h1>
      <AdminSubcategoryMenu categoryId={categoryId!} />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('admin.subcategories')}</h2>
        <nav className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {subcategories.map((s) => (
            <Link key={s.id} to={`/admin/category/${categoryId}/sub/${s.id}`} className="rounded-md border border-border bg-card p-3 hover:bg-accent transition-colors">
              {getTranslatedName(s)}
            </Link>
          ))}
          {subcategories.length === 0 && (
            <p className="text-muted-foreground">{t('admin.no_subcategories')}</p>
          )}
        </nav>
      </section>
    </main>
  );
};

export default AdminCategoryPage;
