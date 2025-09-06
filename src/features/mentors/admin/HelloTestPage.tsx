import React from "react";

export default function HelloTestPage() {
  return (
    <div style={{ 
      padding: "24px", 
      backgroundColor: "white", 
      color: "black",
      minHeight: "100vh"
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>🎯 HELLO TEST PAGE</h1>
      <p>If you see this, basic routing is working!</p>
      <div style={{ 
        marginTop: "16px", 
        padding: "16px", 
        backgroundColor: "#f0f0f0", 
        borderRadius: "4px" 
      }}>
        <h3>Debug Info:</h3>
        <p>URL: {window.location.href}</p>
        <p>Time: {new Date().toISOString()}</p>
      </div>
    </div>
  );
}