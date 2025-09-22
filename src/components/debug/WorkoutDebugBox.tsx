// workout-flow v109.3 — DEBUG (static, non-floating)
import React, { useMemo } from "react";

type DebugData = Record<string, any>;

export default function WorkoutDebugBox({
  version,
  data,
}: {
  version: string;
  data: DebugData;
}) {
  const json = useMemo(() => {
    try {
      return JSON.stringify({ version, ...data }, null, 2);
    } catch {
      return "{}";
    }
  }, [data, version]);

  return (
    <div
      style={{
        margin: "12px 0 16px 0",
        borderRadius: 10,
        padding: 12,
        background: "rgba(255,0,0,0.18)",
        border: "1px solid rgba(255,0,0,0.35)",
        color: "white",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <strong>DEBUG • {version}</strong>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "white",
            padding: "4px 8px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(json);
              alert("Debug copied.");
            } catch {}
          }}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "white",
            padding: "4px 8px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Copy
        </button>
      </div>
      <pre style={{ margin: 0, overflowX: "auto" }}>{json}</pre>
    </div>
  );
}