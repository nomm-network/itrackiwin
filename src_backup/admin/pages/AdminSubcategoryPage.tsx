import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageNav from "@/components/PageNav";
import { useTranslation } from "react-i18next";
import AdminHeaderMenu from "@/admin/components/AdminHeaderMenu";
import AdminSubcategoryMenu from "@/admin/components/AdminSubcategoryMenu";
import { useTranslations } from "@/hooks/useTranslations";

const AdminSubcategoryPage: React.FC = () => {
  const { categoryId, subcategoryId } = useParams();
  const { getTranslatedName, currentLanguage } = useTranslations();

  const { data: category } = useQuery({
    queryKey: ["admin_category", categoryId, currentLanguage],
    queryFn: async () => {
      if (!categoryId) return null;
      const { data, error } = await supabase
        .from("v_categories_with_translations")
        .select("id, slug, translations")
        .eq("id", categoryId)
        .single();
      if (error) throw error;
      return data as { 
        id: string; 
        slug: string | null; 
        translations: Record<string, { name: string; description?: string }> | null;
      };
    },
    enabled: !!categoryId,
  });

  const { data: subcategory } = useQuery({
    queryKey: ["admin_subcategory", subcategoryId, currentLanguage],
    queryFn: async () => {
      if (!subcategoryId) return null;
      const { data, error } = await supabase
        .from("v_subcategories_with_translations")
        .select("id, slug, translations")
        .eq("id", subcategoryId)
        .single();
      if (error) throw error;
      return data as { 
        id: string; 
        slug: string | null; 
        translations: Record<string, { name: string; description?: string }> | null;
      };
    },
    enabled: !!subcategoryId,
  });

  return (
    <main className="container py-6">
      <PageNav current={`Admin / ${category ? getTranslatedName(category) : "Category"} / ${subcategory ? getTranslatedName(subcategory) : "Subcategory"}`} />
      <AdminHeaderMenu />
      {categoryId && <AdminSubcategoryMenu categoryId={categoryId} />}
      <h1 className="sr-only">Admin Subcategory</h1>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{subcategory ? getTranslatedName(subcategory) : "Subcategory"}</h2>
        <p className="text-muted-foreground">Future admin tools for this subcategory will appear here.</p>
      </section>
    </main>
  );
};

export default AdminSubcategoryPage;
