import React, { useEffect, useState } from "react";
import { levelFromXp } from "@/lib/xp";
import { useAppStore } from "@/store/app";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/lib/auth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const Profile: React.FC = () => {
  const xp = useAppStore((s) => s.xp);
  const level = levelFromXp(xp);
  const { isAdmin } = useIsAdmin();
  const [userInfo, setUserInfo] = useState<{
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Get user email from session
      const email = session.user.email || 'No email';

      // Get user role from user_roles table
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      setUserInfo({
        email,
        role: roleData?.role || 'user'
      });
    };

    fetchUserInfo();
  }, []);

  const handleSignOut = async () => {
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: 'global' }); } catch {}
      window.location.href = '/auth';
    } catch (e) {
      window.location.href = '/auth';
    }
  };

  return (
    <>
      <PageNav current="Profile" />
      <main className="container py-8">
        <h1 className="text-2xl font-semibold mb-6">Profile</h1>
        <section className="grid gap-3 max-w-xl">
          <div className="rounded-lg border p-4 bg-card">
            <h2 className="font-medium mb-2">User Information</h2>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="text-sm">{userInfo?.email || 'Loading...'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Role</div>
                <div className="text-sm capitalize">{userInfo?.role || 'Loading...'}</div>
              </div>
            </div>
          </div>
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
          <div className="rounded-lg border p-4 bg-card">
            <h2 className="font-medium mb-2">Account</h2>
            <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
          </div>
        </section>
      </main>
    </>
  );
};

export default Profile;
