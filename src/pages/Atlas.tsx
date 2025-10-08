import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const setSeo = () => {
  const title = "Atlas | I Track I Win";
  const desc = "Your life mission control - track priorities and get AI-powered guidance.";
  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", desc);
};

export default function Atlas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");

  setSeo();

  const { data: priorities } = useQuery({
    queryKey: ["user-priorities", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("user_priorities", {
        p_user_id: user!.id,
      });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: nextCategory } = useQuery({
    queryKey: ["next-best-category", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("next_best_category", {
        p_user_id: user!.id,
      });
      if (error) throw error;
      return data as { slug?: string; name?: string; icon?: string; color?: string } | null;
    },
  });

  const handleAskAtlas = () => {
    // TODO: Implement AI chat routing
    console.log("Ask Atlas:", question);
  };

  return (
    <main className="container max-w-4xl py-8 pb-24">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">🤖 Atlas</h1>
        <p className="text-muted-foreground">
          Your life mission control and AI navigator
        </p>
      </header>

      <div className="space-y-6">
        {/* Priorities Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Your Priorities</CardTitle>
          </CardHeader>
          <CardContent>
            {priorities && priorities.length > 0 ? (
              <div className="space-y-3">
                {priorities.map((priority: any, index: number) => (
                  <button
                    key={priority.category_id}
                    onClick={() => navigate(`/dashboard/${priority.slug}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-2xl">{priority.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{priority.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Priority #{index + 1}
                      </div>
                    </div>
                    {priority.nav_pinned && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Pinned
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No priorities set yet. Visit Settings to configure your focus areas.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Next Best Action */}
        {nextCategory && nextCategory.slug && (
          <Card>
            <CardHeader>
              <CardTitle>Suggested Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => navigate(`/dashboard/${nextCategory.slug}`)}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-left"
              >
                <span className="text-3xl">{nextCategory.icon}</span>
                <div>
                  <div className="font-medium text-lg">{nextCategory.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Work on this next
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        )}

        {/* Ask Atlas */}
        <Card>
          <CardHeader>
            <CardTitle>Ask Atlas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="What do you need help with today? (e.g., 'I need a workout plan' or 'Help me manage stress')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleAskAtlas} 
              disabled={!question.trim()}
              className="w-full"
            >
              Get Guidance
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
