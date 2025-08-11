import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface Props { categoryId: string }

const AdminSubcategoryMenu: React.FC<Props> = ({ categoryId }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const { data: subcategories = [] } = useQuery({
    queryKey: ["admin_subcategories_menu", categoryId],
    queryFn: async () => {
      if (!categoryId) return [] as Array<{ id: string; slug: string | null; name: string }>;
      const { data, error } = await (supabase as any)
        .from("life_subcategories")
        .select("id, slug, name")
        .eq("category_id", categoryId)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; slug: string | null; name: string }>;
    },
    enabled: !!categoryId,
  });

  return (
    <nav aria-label={t("admin.subcategories")} className="mb-4 overflow-x-auto">
      <ul className="flex items-center gap-2 whitespace-nowrap text-sm">
        {subcategories.map((s) => {
          const href = `/admin/category/${categoryId}/sub/${s.id}`;
          const active = location.pathname.startsWith(href);
          const label = t(`subcategories.${s.slug ?? "_"}`, { defaultValue: s.name });
          return (
            <li key={s.id}>
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
        {subcategories.length === 0 && (
          <li className="text-muted-foreground">{t("admin.no_subcategories")}</li>
        )}
      </ul>
    </nav>
  );
};

export default AdminSubcategoryMenu;
