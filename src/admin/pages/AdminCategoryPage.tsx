import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageNav from "@/components/PageNav";

const AdminCategoryPage: React.FC = () => {
  const { categoryId } = useParams();

  const { data: category } = useQuery({
    queryKey: ["admin_category", categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      const { data, error } = await (supabase as any)
        .from("life_categories")
        .select("id, name")
        .eq("id", categoryId)
        .single();
      if (error) throw error;
      return data as { id: string; name: string };
    },
    enabled: !!categoryId,
  });

  const { data: subcategories = [] } = useQuery({
    queryKey: ["admin_subcategories", categoryId],
    queryFn: async () => {
      if (!categoryId) return [] as Array<{ id: string; name: string }>;
      const { data, error } = await (supabase as any)
        .from("life_subcategories")
        .select("id, name")
        .eq("category_id", categoryId)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; name: string }>;
    },
    enabled: !!categoryId,
  });

  return (
    <main className="container py-6">
      <PageNav current={`Admin / ${category?.name ?? "Category"}`} />
      <h1 className="sr-only">Admin Category: {category?.name}</h1>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Subcategories</h2>
        <nav className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {subcategories.map((s) => (
            <Link key={s.id} to={`/admin/category/${categoryId}/sub/${s.id}`} className="rounded-md border border-border bg-card p-3 hover:bg-accent transition-colors">
              {s.name}
            </Link>
          ))}
          {subcategories.length === 0 && (
            <p className="text-muted-foreground">No subcategories yet.</p>
          )}
        </nav>
      </section>
    </main>
  );
};

export default AdminCategoryPage;
