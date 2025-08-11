import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const AdminHeaderMenu: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const { data: categories = [] } = useQuery({
    queryKey: ["admin_categories_menu"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("life_categories")
        .select("id, slug, name")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; slug: string | null; name: string }>;
    },
  });

  return (
    <nav aria-label={t("admin.categories")} className="mb-4 overflow-x-auto">
      <ul className="flex items-center gap-2 whitespace-nowrap text-sm">
        {categories.map((c) => {
          const href = `/admin/category/${c.id}`;
          const active = location.pathname.startsWith(href);
          const label = t(`categories.${c.slug ?? "_"}`, { defaultValue: c.name });
          return (
            <li key={c.id}>
              <Link
                to={href}
                className={`rounded-md border px-3 py-1 transition-colors ${active ? "bg-accent border-border" : "bg-card hover:bg-accent border-border"}`}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
        {categories.length === 0 && (
          <li className="text-muted-foreground">{t("admin.no_categories")}</li>
        )}
      </ul>
    </nav>
  );
};

export default AdminHeaderMenu;
