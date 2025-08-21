import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminMenu: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { label: t('navigation.translations'), href: '/admin/translations' },
    { label: 'Exercise Management', href: '/admin/exercises' },
    { label: 'Muscles', href: '/admin/muscles' },
    { 
      label: 'Others', 
      href: '/admin/others',
      submenu: [
        { label: 'Equipment', href: '/admin/others/equipment' },
        { label: 'Grips', href: '/admin/others/grips' },
        { label: 'Gyms', href: '/admin/others/gyms' }
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