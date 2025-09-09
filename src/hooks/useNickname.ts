import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/features/social/lib/api';

export const useNickname = () => {
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNickname = async () => {
      if (user?.id) {
        try {
          const profile = await getUserProfile(user.id);
          setNickname(profile?.nickname || null);
        } catch (error) {
          console.error('Error fetching nickname:', error);
        }
      }
      setLoading(false);
    };

    fetchNickname();
  }, [user?.id]);

  const updateNickname = (newNickname: string) => {
    setNickname(newNickname);
  };

  return { nickname, loading, updateNickname };
};