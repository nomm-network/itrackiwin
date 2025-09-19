import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CoachTestingComponent() {
  const { user } = useAuth();

  const { data: healthCoaches, isLoading } = useQuery({
    queryKey: ['test-health-coaches', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('coaches_for_category' as any, {
        u: user.id,
        cat_slug: 'health'
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return <div>Please log in to test coach selection</div>;
  }

  if (isLoading) {
    return <div>Loading coaches...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Category Coaches Test</CardTitle>
        <CardDescription>
          Testing the coaches_for_category RPC function for the Health category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {healthCoaches?.map((coach: any) => (
            <div key={coach.coach_id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{coach.display_name}</p>
                <p className="text-sm text-muted-foreground">Type: {coach.type}</p>
              </div>
              <div className="flex items-center gap-2">
                {coach.selected && <Badge variant="default">Selected</Badge>}
                {coach.is_default && <Badge variant="secondary">Default</Badge>}
                {coach.has_access ? (
                  <Badge variant="outline" className="text-green-600">Has Access</Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600">Locked</Badge>
                )}
                {coach.price_cents > 0 && (
                  <Badge variant="destructive">${(coach.price_cents / 100).toFixed(0)}/mo</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded text-sm">
          <p className="font-medium mb-2">Expected Behavior:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Default coaches should show "Has Access" and be selectable</li>
            <li>Premium coaches without subscription should show "Locked"</li>
            <li>Selecting a locked coach should show subscription prompt</li>
            <li>Categories with locked selected coaches won't appear in bottom nav</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}