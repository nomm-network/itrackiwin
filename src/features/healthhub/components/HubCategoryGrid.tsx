import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHubCategories, findHub, getDefaultSubcategory } from "../useHubCategories";

export default function HubCategoryGrid() {
  const { data: hubs, isLoading, error } = useHubCategories();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentHubSlug = searchParams.get("cat") || "";
  const currentHub = findHub(hubs, currentHubSlug);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !hubs?.length) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="col-span-3 text-center text-muted-foreground p-4">
          Failed to load categories
        </div>
      </div>
    );
  }

  const handleHubClick = (hubSlug: string) => {
    const hub = findHub(hubs, hubSlug);
    if (!hub) return;
    
    const defaultSub = getDefaultSubcategory(hub);
    const params = new URLSearchParams();
    params.set("cat", hub.slug);
    if (defaultSub) {
      params.set("sub", defaultSub);
    }
    navigate(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {hubs.slice(0, 6).map((hub) => (
        <Button
          key={hub.slug}
          variant={currentHub?.slug === hub.slug ? "default" : "outline"}
          onClick={() => handleHubClick(hub.slug)}
          className="h-16 flex flex-col items-center gap-1 p-2"
        >
          <span className="text-lg">{hub.icon || "📊"}</span>
          <span className="text-xs leading-tight text-center">
            {hub.label}
          </span>
        </Button>
      ))}
    </div>
  );
}