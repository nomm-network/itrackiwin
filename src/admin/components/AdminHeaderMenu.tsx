import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useTranslations } from "@/hooks/useTranslations";

const AdminHeaderMenu: React.FC = () => {
  const { t } = useTranslation();
  const { getTranslatedName, currentLanguage } = useTranslations();
  const location = useLocation();

  const { data: categories = [] } = useQuery({
    queryKey: ["admin_categories_menu", currentLanguage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_categories_with_translations")
        .select("id, slug, translations, fallback_name")
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
  });

  return (
    <nav aria-label={t("admin.categories")} className="mb-4 overflow-x-auto">
      <ul className="flex items-center gap-2 whitespace-nowrap text-sm">
        {categories.map((c) => {
          const href = `/admin/category/${c.id}`;
          const active = location.pathname.startsWith(href);
          const label = getTranslatedName(c);
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
