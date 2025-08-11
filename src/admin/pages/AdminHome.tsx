import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageNav from "@/components/PageNav";

const AdminHome: React.FC = () => {
  const { data: categories = [] } = useQuery({
    queryKey: ["admin_categories_list"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("life_categories")
        .select("id, name")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; name: string }>;
    },
  });

  return (
    <main className="container py-6">
      <PageNav current="Admin" />
      <h1 className="sr-only">Admin</h1>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <nav className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.id} to={`/admin/category/${c.id}`} className="rounded-md border border-border bg-card p-3 hover:bg-accent transition-colors">
              {c.name}
            </Link>
          ))}
          {categories.length === 0 && (
            <p className="text-muted-foreground">No categories found.</p>
          )}
        </nav>
      </section>
    </main>
  );
};

export default AdminHome;
