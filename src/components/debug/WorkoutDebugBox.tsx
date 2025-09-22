import React, {useMemo, useState} from "react";
import { WORKOUT_FLOW_VERSION } from "@/features/workouts/session/version";

type DebugData = {
  workoutId?: string | null;
  templateId?: string | null;
  title?: string | null;
  readiness?: number | null;
  exerciseCount?: number | null;
  routerPath?: string;
  sourceHint?: "rpc" | "rest" | "unknown";
  lastError?: string | null;
  sample?: unknown;
};

type Props = {
  data: DebugData;
  anchor?: "top" | "bottom";
};

const boxStyle: React.CSSProperties = {
  position: "fixed",
  left: 12,
  right: 12,
  zIndex: 99999,
  padding: 12,
  borderRadius: 10,
  background: "#B00020",
  color: "white",
  fontSize: 12,
  lineHeight: 1.3,
  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
  opacity: 0.95,
};

export default function WorkoutDebugBox({ data, anchor = "top" }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const json = useMemo(() => {
    try {
      return JSON.stringify(
        {
          version: WORKOUT_FLOW_VERSION,
          ...data,
        },
        null,
        2
      );
    } catch {
      return "{}";
    }
  }, [data]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      alert("Debug copied to clipboard.");
    } catch (e) {
      console.error(e);
    }
  };

  const style = {
    ...boxStyle,
    [anchor === "top" ? "top" : "bottom"]: 70,
  } as React.CSSProperties;

  return (
    <div style={style}>
      <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
        <strong>DEBUG • {WORKOUT_FLOW_VERSION}</strong>
        <span style={{opacity: 0.9}}>• workoutId:</span>
        <code style={{background: "rgba(255,255,255,0.15)", padding: "2px 6px", borderRadius: 6}}>
          {data.workoutId || "—"}
        </code>
        <span style={{flex: 1}} />
        <button
          onClick={() => setCollapsed((v) => !v)}
          style={{background: "rgba(255,255,255,0.15)", border: "none", color: "white", padding: "4px 8px", borderRadius: 6}}
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{background: "rgba(255,255,255,0.15)", border: "none", color: "white", padding: "4px 8px", borderRadius: 6}}
        >
          Refresh
        </button>
        <button
          onClick={copy}
          style={{background: "rgba(255,255,255,0.15)", border: "none", color: "white", padding: "4px 8px", borderRadius: 6}}
        >
          Copy
        </button>
      </div>

      {!collapsed && (
        <pre
          style={{
            margin: 0,
            maxHeight: 220,
            overflow: "auto",
            background: "rgba(0,0,0,0.25)",
            padding: 10,
            borderRadius: 8,
            whiteSpace: "pre-wrap",
          }}
        >
{json}
        </pre>
      )}
    </div>
  );
}