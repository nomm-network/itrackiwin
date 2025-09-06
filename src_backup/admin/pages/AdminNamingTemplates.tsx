import React from "react";
import PageNav from "@/components/PageNav";
import { NamingTemplatesList } from "@/components/admin/NamingTemplatesList";

const AdminNamingTemplates: React.FC = () => {
  return (
    <main className="container py-6">
      <PageNav current="Admin / Naming Templates" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Exercise Naming Templates</h1>
          <p className="text-muted-foreground mt-2">
            Manage templates that automatically generate exercise names based on movement patterns, 
            equipment, and attributes. Templates can be scoped globally, to specific movements, or equipment types.
          </p>
        </div>
        <NamingTemplatesList />
      </div>
    </main>
  );
};

export default AdminNamingTemplates;