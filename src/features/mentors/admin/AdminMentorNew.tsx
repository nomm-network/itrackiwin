import React from "react";
import { useParams } from "react-router-dom";
import { MentorForm } from "./MentorForm";
import { AdminErrorBoundary } from "@/components/util/AdminErrorBoundary";

export default function AdminMentorNew() {
  const { id } = useParams();
  const isEditMode = !!id;

  try {
    return (
      <AdminErrorBoundary>
        <div className="container py-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">
              {isEditMode ? "Edit Mentor" : "Add New Mentor"}
            </h1>
            <MentorForm mode={isEditMode ? "edit" : "create"} />
          </div>
        </div>
      </AdminErrorBoundary>
    );
  } catch (e: any) {
    return (
      <div className="container py-6">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Mentor form failed to render</h2>
          <pre className="text-sm text-red-700 whitespace-pre-wrap overflow-auto">
            {e?.message ?? String(e)}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}