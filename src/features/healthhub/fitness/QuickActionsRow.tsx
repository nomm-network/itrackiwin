import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, History, RotateCcw, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActionsRow() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Templates",
      icon: Target,
      onClick: () => navigate("/fitness/templates"),
    },
    {
      label: "History", 
      icon: History,
      onClick: () => navigate("/fitness/history"),
    },
    {
      label: "Programs",
      icon: RotateCcw,
      onClick: () => navigate("/app/programs"),
    },
    {
      label: "Mentors",
      icon: Users,
      onClick: () => navigate("/fitness/mentors"),
    },
  ];

  return (
    <Card>
      <CardContent className="pt-3 sm:pt-6">
        <h3 className="text-lg font-semibold mb-2 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                onClick={action.onClick}
                className="h-12 flex flex-col items-center gap-1 text-xs"
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}