import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminMenu: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { label: t('admin.translations'), href: '/admin/translations' },
    // Add more items later as requested
  ];

  return (
    <nav aria-label={t("admin.main_menu")} className="mb-6 border-b border-border">
      <ul className="flex items-center gap-1">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`block px-4 py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? "border-b-2 border-primary text-primary" 
                    : "text-muted-foreground hover:text-foreground"
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

export default AdminMenu;