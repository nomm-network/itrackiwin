import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CategoryDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: category, isLoading } = useQuery({
    queryKey: ["life-category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("life_categories")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: coaches } = useQuery({
    queryKey: ["category-coaches", user?.id, slug],
    enabled: !!user?.id && !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("coaches_for_category", {
        p_user_id: user!.id,
        p_category_slug: slug!,
      });
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 pb-24">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container max-w-4xl py-8 pb-24">
        <p>Category not found</p>
      </div>
    );
  }

  const selectedCoach = coaches?.find((c: any) => c.is_selected);

  return (
    <main className="container max-w-4xl py-8 pb-24">
      <Button
        variant="ghost"
        onClick={() => navigate('/atlas')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Atlas
      </Button>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{category.icon}</span>
          <h1 className="text-3xl font-bold">{category.name}</h1>
        </div>
        <p className="text-muted-foreground">
          Track your progress and get personalized guidance
        </p>
      </header>

      <div className="space-y-6">
        {/* AI Coach Section */}
        {selectedCoach && (
          <Card>
            <CardHeader>
              <CardTitle>Your {category.name} Coach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{selectedCoach.display_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedCoach.coach_type === 'ai' ? 'AI Coach' : 'Human Mentor'}
                  </div>
                </div>
                <Button onClick={() => {
                  // TODO: Navigate to coach chat
                  console.log('Open coach:', selectedCoach);
                }}>
                  Open Coach
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder for category-specific widgets */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Category-specific features coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
