import React from "react";
import AdminMenu from "../components/AdminMenu";

const AdminHome: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin</h1>
      </div>
      
      <AdminMenu />
      
      <div className="text-center text-muted-foreground mt-8">
        <p>Select a section from the menu above to get started.</p>
      </div>
    </div>
  );
};

export default AdminHome;
