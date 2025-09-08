import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { AdminSidebar } from '@/components/navigation/AdminSidebar';
import { AppHeader } from '@/components/navigation/AppHeader';
import { AdminTopBar } from '@/features/admin/components/AdminTopBar';

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
        case 'ambassadors':
          breadcrumbs.push({ label: 'Ambassadors', href: '/admin/ambassadors' });
          if (pathSegments[2] === 'deals') {
            breadcrumbs.push({ label: 'Deals Verification', href: '/admin/ambassadors/deals' });
          }
          break;
        case 'battles':
          breadcrumbs.push({ label: 'Battles', href: '/admin/battles' });
          if (pathSegments[2]) {
            breadcrumbs.push({ label: 'Battle Detail', href: null });
          }
          break;
        case 'payouts':
          breadcrumbs.push({ label: 'Payouts', href: '/admin/payouts' });
          break;
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
    <div className="min-h-screen">
      {/* Main App Header */}
      <AppHeader />
      
      {/* Admin Category Bar */}
      <AdminTopBar />
      
      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-muted/40 border-r border-border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
          <AdminSidebar />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
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
        
          <div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;