import React from "react";
import PageNav from "@/components/PageNav";
import { AttributeSchemasList } from "@/components/admin/AttributeSchemasList";

const AdminAttributeSchemas: React.FC = () => {
  return (
    <main className="container py-6">
      <PageNav current="Admin / Attribute Schemas" />
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Attribute Schemas</h1>
        <p className="text-muted-foreground">
          Manage dynamic attribute schemas for exercises. Create schemas that define 
          customizable attributes based on movement patterns and equipment types.
        </p>
        <AttributeSchemasList />
      </div>
    </main>
  );
};

export default AdminAttributeSchemas;