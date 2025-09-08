import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { findCategory } from "../categoryRegistry";

export default function HubCategoryGrid({ onSelect }: { onSelect?: (catKey: string) => void }) {
  const nav = useNavigate();
  const goto = (key: string) => {
    if (onSelect) return onSelect(key);
    const c = findCategory(key);
    nav(`/dashboard?cat=${encodeURIComponent(c.key)}&sub=${encodeURIComponent(c.defaultSub)}`);
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Button
        variant="outline"
        onClick={() => goto("health.fitness")}
        className="h-16 flex flex-col items-center gap-1 p-2"
      >
        <span className="text-lg">💪</span>
        <span className="text-xs leading-tight text-center">Fitness</span>
      </Button>
      
      <Button
        variant="outline"
        onClick={() => goto("health.nutrition")}
        className="h-16 flex flex-col items-center gap-1 p-2"
      >
        <span className="text-lg">🥗</span>
        <span className="text-xs leading-tight text-center">Nutrition</span>
      </Button>
      
      <Button
        variant="outline"
        onClick={() => goto("health.sleep")}
        className="h-16 flex flex-col items-center gap-1 p-2"
      >
        <span className="text-lg">😴</span>
        <span className="text-xs leading-tight text-center">Sleep</span>
      </Button>
      
      <Button
        variant="outline"
        onClick={() => goto("health.medical")}
        className="h-16 flex flex-col items-center gap-1 p-2"
      >
        <span className="text-lg">📋</span>
        <span className="text-xs leading-tight text-center">Medical</span>
      </Button>
      
      <Button
        variant="outline"
        onClick={() => goto("health.energy")}
        className="h-16 flex flex-col items-center gap-1 p-2"
      >
        <span className="text-lg">⚡</span>
        <span className="text-xs leading-tight text-center">Energy</span>
      </Button>
      
      <Button
        variant="outline"
        onClick={() => goto("health.configure")}
        className="h-16 flex flex-col items-center gap-1 p-2"
      >
        <span className="text-lg">⚙️</span>
        <span className="text-xs leading-tight text-center">Configure</span>
      </Button>
    </div>
  );
}