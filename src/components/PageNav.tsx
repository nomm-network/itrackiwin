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
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface PageNavProps {
  current: string;
}

const PageNav: React.FC<PageNavProps> = ({ current }) => {
  const { isAdmin } = useIsAdmin();

  return (
    <header className="container py-4">
      <nav aria-label="Breadcrumb" className="flex items-center justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
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
          <Link to="/dashboard">Dashboard</Link>
          {isAdmin && <Link to="/admin">Admin</Link>}
        </div>
      </nav>
    </header>
  );
};

export default PageNav;
