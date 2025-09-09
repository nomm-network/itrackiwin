import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserNickname, getUserProfile } from '@/features/social/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNickname } from '@/hooks/useNickname';
import { AvatarUpload } from './AvatarUpload';

interface NicknameSetupProps {
  onNicknameSet?: (nickname: string) => void;
}

export const NicknameSetup: React.FC<NicknameSetupProps> = ({ onNicknameSet }) => {
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<{ nickname?: string; avatar_url?: string } | null>(null);
  const { user } = useAuth();
  const { nickname: currentNickname, updateNickname, refreshNickname } = useNickname();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          setCurrentProfile(profile);
          if (profile?.nickname) {
            setNickname(profile.nickname);
          }
          if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (currentNickname) {
      setNickname(currentNickname);
    }
  }, [currentNickname]);

  const updateNicknameMutation = useMutation({
    mutationFn: () => updateUserNickname(nickname.trim(), avatarUrl),
    onSuccess: () => {
      const newNickname = nickname.trim();
      updateNickname(newNickname);
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-nickname'] });
      onNicknameSet?.(newNickname);
      refreshNickname(); // Force refresh
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  });

  const handleSubmit = () => {
    const hasNicknameChanged = nickname.trim() !== currentProfile?.nickname;
    const hasAvatarChanged = avatarUrl !== currentProfile?.avatar_url;
    
    if (nickname.trim() && (hasNicknameChanged || hasAvatarChanged)) {
      updateNicknameMutation.mutate();
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <AvatarUpload
            currentAvatarUrl={avatarUrl}
            onAvatarChange={setAvatarUrl}
            disabled={updateNicknameMutation.isPending}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Nickname {currentProfile?.nickname && `(Current: ${currentProfile.nickname})`}
          </label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname..."
            maxLength={50}
          />
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={!nickname.trim() || updateNicknameMutation.isPending}
          className="w-full"
        >
          {updateNicknameMutation.isPending ? 'Updating...' : 'Update Profile'}
        </Button>
      </CardContent>
    </Card>
  );
};