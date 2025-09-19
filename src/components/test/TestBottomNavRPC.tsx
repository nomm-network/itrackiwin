import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function TestBottomNavRPC() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['test-bottom-nav', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Test the RPC directly
      const { data, error } = await supabase.rpc('user_bottom_nav' as any, {
        u: user.id
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return <div>Not authenticated</div>;
  }

  if (isLoading) {
    return <div>Loading RPC test...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        <h3>RPC Error:</h3>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 rounded">
      <h3 className="font-bold mb-2">Bottom Nav RPC Test Results:</h3>
      <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}