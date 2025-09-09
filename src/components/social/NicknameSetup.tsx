import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserNickname, getUserProfile } from '@/features/social/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNickname } from '@/hooks/useNickname';

interface NicknameSetupProps {
  onNicknameSet?: (nickname: string) => void;
}

export const NicknameSetup: React.FC<NicknameSetupProps> = ({ onNicknameSet }) => {
  const [nickname, setNickname] = useState('');
  const { user } = useAuth();
  const { nickname: currentNickname, updateNickname, refreshNickname } = useNickname();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentNickname) {
      setNickname(currentNickname);
    }
  }, [currentNickname]);

  const updateNicknameMutation = useMutation({
    mutationFn: () => updateUserNickname(nickname.trim()),
    onSuccess: () => {
      const newNickname = nickname.trim();
      updateNickname(newNickname);
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-nickname'] });
      onNicknameSet?.(newNickname);
      refreshNickname(); // Force refresh
      toast.success('Nickname updated successfully!');
      
      // Small delay then refresh the page to ensure proper state update
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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