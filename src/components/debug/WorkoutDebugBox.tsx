// workout-flow v110.0 — DEBUG (static block)
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
        margin: "12px 12px 0 12px",
        padding: 12,
        borderRadius: 10,
        background: "rgba(220,38,38,0.95)", // red
        color: "#fff",
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace',
        fontSize: 12,
        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.15)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        <strong>DEBUG • {version}</strong>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "rgba(255,255,255,0.18)",
            border: "none",
            color: "#fff",
            padding: "3px 8px",
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
            background: "rgba(255,255,255,0.18)",
            border: "none",
            color: "#fff",
            padding: "3px 8px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Copy
        </button>
      </div>
      <code>{json}</code>
    </div>
  );
}