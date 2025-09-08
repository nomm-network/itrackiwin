import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hub } from "../useHubCategories";

interface HubCategoryGridProps {
  hub: Hub;
  activeSub?: string;
}

export default function HubCategoryGrid({ hub, activeSub }: HubCategoryGridProps) {
  const navigate = useNavigate();

  const handleSubClick = (subSlug: string) => {
    const params = new URLSearchParams();
    params.set("cat", hub.slug);
    params.set("sub", subSlug);
    navigate(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {hub.subs.slice(0, 6).map((sub) => (
        <Button
          key={sub.slug}
          variant={activeSub === sub.slug ? "default" : "outline"}
          onClick={() => handleSubClick(sub.slug)}
          className="h-16 flex flex-col items-center gap-1 p-2"
        >
          <span className="text-lg">{sub.icon || "📊"}</span>
          <span className="text-xs leading-tight text-center">
            {sub.label}
          </span>
        </Button>
      ))}
    </div>
  );
}