import React from "react";

export default function AdminMentorEditPageUltraSimple() {
  console.log("🐛 Ultra simple mentor page rendering");
  
  return (
    <div style={{ padding: 24 }}>
      <h1>Add Mentor - Ultra Simple</h1>
      <p>✅ Minimal page render OK.</p>
      <p>✅ No database calls</p>
      <p>✅ No complex components</p>
      <p>✅ No authentication logic</p>
      <div style={{ marginTop: 16, padding: 16, background: "#f0f0f0", borderRadius: 4 }}>
        <h3>Debug Info:</h3>
        <p>Current URL: {window.location.href}</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>
    </div>
  );
}