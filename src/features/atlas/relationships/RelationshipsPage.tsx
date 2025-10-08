import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ConnectionSnapshot } from "./components/ConnectionSnapshot";
import { RelationshipMetrics } from "./components/RelationshipMetrics";
import { RelationshipInsights } from "./components/RelationshipInsights";
import { SocialHabits } from "./components/SocialHabits";
import { ConnectedPlanets } from "./components/ConnectedPlanets";
import { Heart } from "lucide-react";

export default function RelationshipsPage() {
  const navigate = useNavigate();
  const connectionScore = 82;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 p-4 pb-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Relationships</h1>
              <p className="text-sm text-muted-foreground">Social wellbeing & connections</p>
            </div>
          </div>
          <Badge variant="outline" className="text-pink-500">
            {connectionScore}/100
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        <ConnectionSnapshot />
        <RelationshipMetrics />
        <RelationshipInsights />
        <SocialHabits />
        <ConnectedPlanets />
      </div>
    </div>
  );
}
