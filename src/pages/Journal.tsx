import React, { useState } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const Journal: React.FC = () => {
  const addReflection = useAppStore((s) => s.addReflection);
  const reflections = useAppStore((s) => s.reflections);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-semibold mb-6">Journal</h1>
      <form
        className="space-y-3 max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim()) return;
          addReflection({ user_id: "local", text: note.trim(), mood });
          setNote("");
          setMood("");
        }}
      >
        <Input placeholder="Mood (optional)" value={mood} onChange={(e) => setMood(e.target.value)} />
        <Textarea placeholder="What happened today?" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit">Save Entry</Button>
      </form>
      <section className="mt-8 grid gap-3">
        {reflections.slice().reverse().map((r) => (
          <article key={r.id} className="rounded-lg border p-4 bg-card">
            <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()} {r.mood && `• ${r.mood}`}</div>
            <p className="mt-2">{r.text}</p>
          </article>
        ))}
        {reflections.length === 0 && (
          <p className="text-sm text-muted-foreground">No entries yet. Your daily check-in starts here.</p>
        )}
      </section>
    </main>
  );
};

export default Journal;
