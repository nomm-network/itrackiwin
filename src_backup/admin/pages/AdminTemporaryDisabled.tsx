import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageNav from '@/components/PageNav';
import AdminMenu from '@/admin/components/AdminMenu';

const AdminTemporaryDisabled = ({ pageName }: { pageName: string }) => {
  return (
    <div className="container mx-auto py-6">
      <PageNav current={`Admin / ${pageName}`} />
      
      <div className="flex gap-6">
        <AdminMenu />
        
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>{pageName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  This page is temporarily disabled while we complete the handle system removal.
                </p>
                <p className="text-sm">
                  Handle management has been replaced with Equipment-Grip Compatibility management.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminTemporaryDisabled;