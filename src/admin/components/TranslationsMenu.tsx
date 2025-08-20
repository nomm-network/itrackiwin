import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TranslationsMenu: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { label: t('navigation.categories'), href: '/admin/translations/categories' },
    { label: t('navigation.subcategories'), href: '/admin/translations/subcategories' },
    { label: t('navigation.exercises'), href: '/admin/translations/exercises' },
    { label: 'Muscles', href: '/admin/translations/muscles' },
  ];

  return (
    <nav aria-label={t("navigation.translations_menu")} className="mb-6">
      <ul className="flex items-center gap-2 flex-wrap">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TranslationsMenu;