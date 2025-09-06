import React from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useTranslation } from "react-i18next";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";

interface PageNavProps {
  current: string;
}

const PageNav: React.FC<PageNavProps> = ({ current }) => {
  const { t } = useTranslation();
  const { isSuperAdmin } = useIsSuperAdmin();

  return (
    <header className="container py-4">
      <nav aria-label="Breadcrumb" className="flex items-center justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">{t('common.home')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{current}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/dashboard">{t('common.dashboard')}</Link>
          {isSuperAdmin && <Link to="/admin">{t('common.admin')}</Link>}
        </div>
      </nav>
    </header>
  );
};

export default PageNav;
