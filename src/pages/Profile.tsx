import React from "react";
import { levelFromXp } from "@/lib/xp";
import { useAppStore } from "@/store/app";
import PageNav from "@/components/PageNav";

const Profile: React.FC = () => {
  const xp = useAppStore((s) => s.xp);
  const level = levelFromXp(xp);
  return (
    <>
      <PageNav current="Profile" />
      <main className="container py-8">
        <h1 className="text-2xl font-semibold mb-6">Profile</h1>
        <section className="grid gap-3 max-w-xl">
          <div className="rounded-lg border p-4 bg-card">
            <div className="text-sm text-muted-foreground">XP</div>
            <div className="text-2xl font-semibold">{xp}</div>
            <div className="text-sm">Level {level}</div>
          </div>
          <div className="rounded-lg border p-4 bg-card">
            <h2 className="font-medium">Subscription</h2>
            <p className="text-sm text-muted-foreground">Free tier (placeholder). Stripe customer creation will be wired when env is present.</p>
          </div>
          <div className="rounded-lg border p-4 bg-card">
            <h2 className="font-medium">Legal</h2>
            <p className="text-sm">
              <a className="story-link" href="/privacy">Privacy Policy</a> • <a className="story-link" href="/terms">Terms</a>
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default Profile;
