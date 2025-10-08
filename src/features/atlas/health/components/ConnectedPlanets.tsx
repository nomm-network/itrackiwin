import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Utensils, Brain, ArrowRight } from "lucide-react";

interface Planet {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  description: string;
}

const planets: Planet[] = [
  {
    id: "fitness",
    name: "Fitness",
    icon: <Dumbbell className="w-5 h-5" />,
    path: "/fitness",
    color: "from-orange-500/20 to-red-500/20 text-orange-500",
    description: "Workouts & Recovery"
  },
  {
    id: "nutrition",
    name: "Nutrition",
    icon: <Utensils className="w-5 h-5" />,
    path: "/nutrition",
    color: "from-green-500/20 to-emerald-500/20 text-green-500",
    description: "Meals & Energy"
  },
  {
    id: "mind",
    name: "Mind",
    icon: <Brain className="w-5 h-5" />,
    path: "/mind",
    color: "from-purple-500/20 to-pink-500/20 text-purple-500",
    description: "Stress & Sleep"
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
