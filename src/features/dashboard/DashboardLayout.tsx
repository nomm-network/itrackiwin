import React from 'react';

type SlotProps = {
  Header: React.ReactNode;
  SubcategoryNav: React.ReactNode;
  QuickStartWidget: React.ReactNode;
  QuickActions: React.ReactNode;
  OtherWidgets: React.ReactNode;
  EmptyState?: React.ReactNode;
};

export default function DashboardLayout({ 
  Header, 
  SubcategoryNav, 
  QuickStartWidget, 
  QuickActions, 
  OtherWidgets,
  EmptyState 
}: SlotProps) {
  return (
    <div className="container mx-auto p-2 sm:p-6 space-y-2 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      {Header}

      {/* Subcategory Navigation */}
      {SubcategoryNav}

      {/* Quick Start Widgets */}
      {QuickStartWidget}

      {/* Quick Actions */}
      {QuickActions}

      {/* Other Widgets */}
      {OtherWidgets}

      {/* Empty State */}
      {EmptyState}
    </div>
  );
}
