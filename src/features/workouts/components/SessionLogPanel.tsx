import React from 'react';

export default function SessionLogPanel({ lines }: { lines: string[] }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur">
      <details className="mx-auto max-w-3xl px-4 py-2 open:pb-3">
        <summary className="cursor-pointer text-sm font-medium">Session details / debug</summary>
        <div className="mt-2 max-h-52 overflow-auto rounded-md border bg-card p-2 text-xs font-mono">
          {lines.length === 0 ? (
            <div className="text-muted-foreground">No entries yet…</div>
          ) : lines.map((l, i) => <div key={i} className="py-0.5">{l}</div>)}
        </div>
      </details>
    </div>
  );
}