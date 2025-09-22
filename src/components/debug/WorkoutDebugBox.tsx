// v108 — WorkoutDebugBox.tsx (SOT)
// Always visible red box pinned to bottom-left (mobile-safe).
import React from "react";

type Props = {
  tag?: string;
  data?: unknown;
  extra?: Record<string, unknown>;
};

const boxStyle: React.CSSProperties = {
  position: "fixed",
  left: 8,
  bottom: 8,
  right: 8,
  zIndex: 9999,
  background: "rgba(180,0,0,0.92)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: 10,
  color: "white",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  padding: 12,
  maxHeight: "38vh",
  overflow: "auto",
  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
};

export default function WorkoutDebugBox({ tag = "WorkoutSession.page", data, extra }: Props) {
  // Add console log to verify this component is mounting
  React.useEffect(() => {
    console.log('[v108] Mounted: WorkoutDebugBox');
  }, []);

  const payload = {
    tag,
    hasData: !!data,
    dataObject: data ? "HAS_DATA" : "NO_DATA",
    ...extra,
  };
  return (
    <div style={boxStyle}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>DEBUG v108 — {tag}</div>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}