import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "stable" | null;
  trendValue?: string;
  color?: "blue" | "indigo" | "orange" | "red" | "green" | "purple";
}

const colorClasses = {
  blue: "from-blue-500/20 to-blue-600/20 text-blue-500",
  indigo: "from-indigo-500/20 to-indigo-600/20 text-indigo-500",
  orange: "from-orange-500/20 to-orange-600/20 text-orange-500",
  red: "from-red-500/20 to-red-600/20 text-red-500",
  green: "from-green-500/20 to-green-600/20 text-green-500",
  purple: "from-purple-500/20 to-purple-600/20 text-purple-500",
};

export function MetricCard({ icon, title, value, unit, trend, trendValue, color = "blue" }: MetricCardProps) {
  const colorClass = colorClasses[color];
  const [gradientClass, iconColorClass] = colorClass.split(" text-");

  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center text-${iconColorClass}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
          }`}>
            {trend === "up" && <TrendingUp className="w-3 h-3" />}
            {trend === "down" && <TrendingDown className="w-3 h-3" />}
            {trend === "stable" && <Minus className="w-3 h-3" />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </Card>
  );
}
