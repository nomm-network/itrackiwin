import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Target, Moon, Brain, ArrowRight } from "lucide-react";

const planets = [
  {
    id: "purpose",
    name: "Purpose",
    icon: <Target className="w-5 h-5" />,
    path: "/atlas/purpose",
    color: "from-amber-500/20 to-orange-500/20 text-amber-500",
    description: "Career & Goals"
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    icon: <Moon className="w-5 h-5" />,
    path: "/atlas/lifestyle",
    color: "from-blue-500/20 to-cyan-500/20 text-blue-500",
    description: "Daily Balance"
  },
  {
    id: "mind",
    name: "Mind",
    icon: <Brain className="w-5 h-5" />,
    path: "/atlas/mind",
    color: "from-purple-500/20 to-pink-500/20 text-purple-500",
    description: "Stress & Peace"
  },
];

export function ConnectedPlanets() {
  const navigate = useNavigate();

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <h2 className="text-lg font-semibold mb-4">Connected Planets</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {planets.map((planet) => {
          const [gradientClass, iconColorClass] = planet.color.split(" text-");
          
          return (
            <button
              key={planet.id}
              onClick={() => navigate(planet.path)}
              className="p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-all text-left group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-3 text-${iconColorClass}`}>
                {planet.icon}
              </div>
              <h3 className="font-semibold mb-1 flex items-center justify-between">
                {planet.name}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-muted-foreground">{planet.description}</p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
