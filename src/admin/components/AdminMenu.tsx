import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminMenu: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { 
      label: 'Setup Flow', 
      href: '/admin/setup',
      submenu: [
        { label: '1. Body Taxonomy', href: '/admin/setup/body-taxonomy' },
        { label: '2. Equipment', href: '/admin/setup/equipment' },
        { label: '3. Handles', href: '/admin/setup/handles' },
        { label: '4. Grips', href: '/admin/setup/grips' },
        { label: '5.1 Handle-Equipment', href: '/admin/setup/handle-equipment-compatibility' },
        { label: '5.2 Handle-Grip', href: '/admin/setup/handle-grip-compatibility' },
        { label: '5.3 Equipment Defaults', href: '/admin/setup/compatibility' },
        { label: '6. Movement Patterns', href: '/admin/setup/movement-patterns' },
        { label: '7. Tags & Aliases', href: '/admin/setup/tags-aliases' },
      ]
    },
    { label: 'Exercise Management', href: '/admin/exercises' },
    { label: t('navigation.translations'), href: '/admin/translations' },
    { label: 'Tools', href: '/admin/tools', submenu: [
        { label: 'Attribute Schemas', href: '/admin/attribute-schemas' },
        { label: 'Naming Templates', href: '/admin/naming-templates' },
        { label: 'Coach Logs', href: '/admin/coach-logs' },
      ]
    },
  ];

  return (
    <nav aria-label={t("navigation.main_menu")} className="mb-6 border-b border-border">
      <ul className="flex items-center gap-1">
        {menuItems.map((item) => {
          const isActive = item.submenu 
            ? item.submenu.some(sub => location.pathname.startsWith(sub.href))
            : location.pathname.startsWith(item.href);
          
          if (item.submenu) {
            return (
              <li key={item.href} className="relative group">
                <button
                  className={`block px-4 py-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? "border-b-2 border-primary text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
                <ul className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[200px]">
                  {item.submenu.map((subItem) => {
                    const subIsActive = location.pathname.startsWith(subItem.href);
                    return (
                      <li key={subItem.href}>
                        <Link
                          to={subItem.href}
                          className={`block px-4 py-2 text-sm transition-colors hover:bg-muted ${
                            subIsActive ? "bg-muted text-primary font-medium" : ""
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          }
          
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