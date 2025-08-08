import { format } from "date-fns";
import { useAppStore } from "@/store/app";

export function useSimpleInsights() {
  const logs = useAppStore((s) => s.habitLogs);
  const messages: string[] = [];
  if (logs.length === 0) {
    messages.push("Log a habit to start generating insights.");
  } else {
    const byDay = new Map<string, number>();
    logs.forEach((l) => {
      const d = format(new Date(l.completed_at), "EEE");
      byDay.set(d, (byDay.get(d) || 0) + 1);
    });
    const best = Array.from(byDay.entries()).sort((a, b) => b[1] - a[1])[0];
    if (best) messages.push(`You're most consistent on ${best[0]}.`);
  }
  messages.push("Correlations coming soon (placeholder).");
  return messages;
}
