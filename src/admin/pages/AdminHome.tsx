import React from "react";

const AdminHome: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the admin panel. Use the sidebar to navigate to different sections.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border border-border rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Ambassadors</h3>
          <p className="text-muted-foreground text-sm">
            Manage ambassador profiles, verify deals, and track performance.
          </p>
        </div>
        
        <div className="p-6 border border-border rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Battles</h3>
          <p className="text-muted-foreground text-sm">
            Oversee city battles, track participants, and manage competitions.
          </p>
        </div>
        
        <div className="p-6 border border-border rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Payouts</h3>
          <p className="text-muted-foreground text-sm">
            Export commission reports and manage ambassador payments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
