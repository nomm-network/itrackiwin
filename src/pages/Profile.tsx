import React, { useEffect, useState } from "react";
import { levelFromXp } from "@/lib/xp";
import { useAppStore } from "@/store/app";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/lib/auth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { getUserProfile, updateUserNickname } from "@/features/social/lib/api";
import { toast } from "sonner";
import { Edit2, Save, X } from "lucide-react";
import { AvatarUpload } from "@/components/social/AvatarUpload";

const Profile: React.FC = () => {
  const xp = useAppStore((s) => s.xp);
  const level = levelFromXp(xp);
  const { isAdmin } = useIsAdmin();
  const [userInfo, setUserInfo] = useState<{
    email: string;
    role: string;
  } | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState<string>('');

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

      // Get user profile (nickname and avatar)
      try {
        const profile = await getUserProfile(session.user.id);
        setNickname(profile?.nickname || '');
        setAvatarUrl(profile?.avatar_url || null);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }

      setUserInfo({
        email,
        role: roleData?.role || 'user'
      });
    };

    fetchUserInfo();
  }, []);

  const handleEditNickname = () => {
    setTempNickname(nickname);
    setIsEditingNickname(true);
  };

  const handleSaveNickname = async () => {
    try {
      await updateUserNickname(tempNickname.trim(), avatarUrl);
      setNickname(tempNickname.trim());
      setIsEditingNickname(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarChange = async (newAvatarUrl: string | null) => {
    try {
      await updateUserNickname(nickname, newAvatarUrl);
      setAvatarUrl(newAvatarUrl);
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    }
  };

  const handleCancelEdit = () => {
    setTempNickname('');
    setIsEditingNickname(false);
  };

  const handleDeleteNickname = async () => {
    try {
      await updateUserNickname('');
      setNickname('');
      toast.success('Nickname removed successfully!');
    } catch (error) {
      console.error('Error removing nickname:', error);
      toast.error('Failed to remove nickname');
    }
  };

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
            <h2 className="font-medium mb-4">Avatar</h2>
            <div className="flex justify-center">
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                onAvatarChange={handleAvatarChange}
                showText={false}
              />
            </div>
          </div>
          
          <div className="rounded-lg border p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium">Nickname</h2>
              {!isEditingNickname && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditNickname}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {isEditingNickname ? (
              <div className="space-y-3">
                <Input
                  value={tempNickname}
                  onChange={(e) => setTempNickname(e.target.value)}
                  placeholder="Enter your nickname..."
                  maxLength={50}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveNickname}
                    disabled={tempNickname.trim() === nickname}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm">
                  {nickname || (
                    <span className="text-muted-foreground italic">No nickname set</span>
                  )}
                </div>
                {nickname && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteNickname}
                    className="text-xs"
                  >
                    Remove Nickname
                  </Button>
                )}
              </div>
            )}
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