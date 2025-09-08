import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/features/dashboard/DashboardLayout';
import { adapters } from '@/features/dashboard/categoryAdapters';
import { useLifeCategoriesWithSubcategories } from '@/hooks/useLifeCategories';

const Dashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { data: categories, isLoading } = useLifeCategoriesWithSubcategories('en');
  
  // Determine category from URL params or default to fitness
  const cat = searchParams.get("cat") ?? "health.fitness";
  
  // Choose adapter but never change the layout
  const A = useMemo(() => adapters[cat] ?? adapters["health.fitness"], [cat]);

  if (isLoading || !categories) {
    return (
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <DashboardLayout
      Header={<A.Header />}
      SubcategoryNav={<A.SubcategoryNav />}
      QuickStartWidget={<A.QuickStartWidget />}
      QuickActions={<A.QuickActions />}
      OtherWidgets={<A.OtherWidgets />}
      EmptyState={<A.EmptyState />}
    />
  );
};

export default Dashboard;