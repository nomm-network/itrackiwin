import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { updateUserNickname, getUserProfile } from '@/features/social/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export const NicknameSetup: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [currentNickname, setCurrentNickname] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCurrentNickname = async () => {
      if (user?.id) {
        try {
          const profile = await getUserProfile(user.id);
          setCurrentNickname(profile?.nickname || null);
          setNickname(profile?.nickname || '');
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    fetchCurrentNickname();
  }, [user?.id]);

  const updateNicknameMutation = useMutation({
    mutationFn: () => updateUserNickname(nickname.trim()),
    onSuccess: () => {
      setCurrentNickname(nickname.trim());
      toast.success('Nickname updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating nickname:', error);
      toast.error('Failed to update nickname');
    }
  });

  const handleSubmit = () => {
    if (nickname.trim() && nickname.trim() !== currentNickname) {
      updateNicknameMutation.mutate();
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Your Nickname</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Nickname {currentNickname && `(Current: ${currentNickname})`}
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
          disabled={!nickname.trim() || nickname.trim() === currentNickname || updateNicknameMutation.isPending}
          className="w-full"
        >
          {updateNicknameMutation.isPending ? 'Updating...' : 'Update Nickname'}
        </Button>
      </CardContent>
    </Card>
  );
};