import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AtlasChat } from "@/components/atlas/AtlasChat";
import { CategoryPreferencesSettings } from "@/components/atlas/CategoryPreferencesSettings";
import { useUserPriorities } from "@/hooks/useUserPriorities";
import { useNextBestCategory } from "@/hooks/useNextBestCategory";
import { Settings, Star, ArrowRight } from "lucide-react";

export default function OrbitPlanetsPage() {
  const navigate = useNavigate();
  const { data: priorities, isLoading: prioritiesLoading } = useUserPriorities();
  const { data: nextBest, isLoading: nextBestLoading } = useNextBestCategory();
  
  const topPriority = priorities?.[0];
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Greeting Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Hello there!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPriority ? (
              <p className="text-lg">
                You're focusing on <span className="font-semibold text-primary">{topPriority.name}</span>. Great! 
                {nextBest && (
                  <span> Next up: <span className="font-semibold">{nextBest.name}</span>.</span>
                )}
              </p>
            ) : (
              <p className="text-lg">Let's set up your priorities to get started!</p>
            )}
            
            {nextBest && (
              <Button 
                onClick={() => navigate(`/area/${nextBest.slug}`)}
                className="w-full sm:w-auto"
              >
                Open {nextBest.name} Coach
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Priorities Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Priorities</span>
            <CategoryPreferencesSettings />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prioritiesLoading ? (
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-full" />
              ))}
            </div>
          ) : priorities && priorities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {priorities.map((priority, index) => (
                <Badge 
                  key={priority.category_id}
                  variant={index === 0 ? "default" : "secondary"}
                  className="text-sm px-3 py-1"
                >
                  {priority.icon} {priority.name}
                  {index === 0 && <Star className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No priorities set yet.</p>
              <CategoryPreferencesSettings />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Atlas Chat */}
      <AtlasChat />
    </div>
  );
}