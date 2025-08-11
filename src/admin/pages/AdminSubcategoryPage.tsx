import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageNav from "@/components/PageNav";
import { useTranslation } from "react-i18next";
import AdminHeaderMenu from "@/admin/components/AdminHeaderMenu";
import AdminSubcategoryMenu from "@/admin/components/AdminSubcategoryMenu";
const AdminSubcategoryPage: React.FC = () => {
  const { categoryId, subcategoryId } = useParams();

  const { data: category } = useQuery({
    queryKey: ["admin_category", categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      const { data, error } = await (supabase as any)
        .from("life_categories")
        .select("id, slug, name")
        .eq("id", categoryId)
        .single();
      if (error) throw error;
      return data as { id: string; slug: string | null; name: string };
    },
    enabled: !!categoryId,
  });

  const { data: subcategory } = useQuery({
    queryKey: ["admin_subcategory", subcategoryId],
    queryFn: async () => {
      if (!subcategoryId) return null;
      const { data, error } = await (supabase as any)
        .from("life_subcategories")
        .select("id, slug, name")
        .eq("id", subcategoryId)
        .single();
      if (error) throw error;
      return data as { id: string; slug: string | null; name: string };
    },
    enabled: !!subcategoryId,
  });

  return (
    <main className="container py-6">
      <PageNav current={`Admin / ${category?.name ?? "Category"} / ${subcategory?.name ?? "Subcategory"}`} />
      <AdminHeaderMenu />
      {categoryId && <AdminSubcategoryMenu categoryId={categoryId} />}
      <h1 className="sr-only">Admin Subcategory</h1>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{subcategory?.name}</h2>
        <p className="text-muted-foreground">Future admin tools for this subcategory will appear here.</p>
      </section>
    </main>
  );
};

export default AdminSubcategoryPage;
