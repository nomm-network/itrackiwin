import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/lib/auth";

const setSeo = () => {
  const title = "Login | I Track I Win";
  const desc = "Login or sign up to I Track I Win using email or social (Google, Facebook, Twitter).";
  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", desc);
  const linkCanonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
  linkCanonical.setAttribute('rel', 'canonical');
  linkCanonical.setAttribute('href', window.location.href);
  if (!linkCanonical.isConnected) document.head.appendChild(linkCanonical);
};

const Auth: React.FC = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = useMemo(() => `${window.location.origin}/`, []);

  useEffect(() => {
    setSeo();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        window.location.href = "/";
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        window.location.href = "/";
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: 'global' }); } catch {}
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setMessage("Check your email to confirm your account.");
    } catch (err: any) {
      setError(err?.message || "Failed to sign up.");
    } finally {
      setLoading(false);
    }
  };

  const oauth = async (provider: "google" | "facebook" | "twitter") => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err?.message || `Failed to sign in with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container max-w-md py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Sign {mode === 'signin' ? 'In' : 'Up'}</h1>
        <p className="text-sm text-muted-foreground">
          Use email & password or continue with Google, Facebook, or Twitter.
        </p>
      </header>

      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          <Button variant="outline" onClick={() => oauth("google")}>Continue with Google</Button>
          <Button variant="outline" onClick={() => oauth("facebook")}>Continue with Facebook</Button>
          <Button variant="outline" onClick={() => oauth("twitter")}>Continue with Twitter</Button>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <form className="space-y-3" onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}>
          <div className="space-y-1">
            <label className="text-sm" htmlFor="email">Email</label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm" htmlFor="password">Password</label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="text-sm">
          {mode === 'signin' ? (
            <button className="underline" onClick={() => setMode("signup")}>Need an account? Sign up</button>
          ) : (
            <button className="underline" onClick={() => setMode("signin")}>Already have an account? Sign in</button>
          )}
        </div>

        <aside className="text-xs text-muted-foreground">
          Note: Instagram login isn't supported by Supabase. Facebook, Google, and Twitter are available.
        </aside>
      </section>
    </main>
  );
};

export default Auth;
