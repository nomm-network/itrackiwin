import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import AdminMenu from '../components/AdminMenu';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Admin', href: '/admin' }];
    
    if (pathSegments.length > 1) {
      const section = pathSegments[1];
      switch (section) {
        case 'exercises':
          breadcrumbs.push({ label: 'Exercises', href: '/admin/exercises' });
          break;
        case 'muscles':
          breadcrumbs.push({ label: 'Muscles', href: '/admin/muscles' });
          break;
        case 'others':
          breadcrumbs.push({ label: 'Others', href: null });
          if (pathSegments[2] === 'equipment') {
            breadcrumbs.push({ label: 'Equipment', href: '/admin/others/equipment' });
          } else if (pathSegments[2] === 'grips') {
            breadcrumbs.push({ label: 'Grips', href: '/admin/others/grips' });
          }
          break;
        case 'translations':
          breadcrumbs.push({ label: 'Translations', href: '/admin/translations' });
          if (pathSegments[2]) {
            const subSection = pathSegments[2];
            breadcrumbs.push({ 
              label: subSection.charAt(0).toUpperCase() + subSection.slice(1), 
              href: `/admin/translations/${subSection}` 
            });
          }
          break;
        case 'category':
          breadcrumbs.push({ label: 'Category', href: null });
          break;
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <main className="container py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {crumb.href && index < breadcrumbs.length - 1 ? (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      
      <AdminMenu />
      
      <div className="mt-6">
        {children}
      </div>
    </main>
  );
};

export default AdminLayout;