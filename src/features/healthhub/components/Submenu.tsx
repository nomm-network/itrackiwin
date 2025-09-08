import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hub } from "../useHubCategories";

interface SubmenuProps {
  hub: Hub;
  activeSub?: string;
}

export default function Submenu({ hub, activeSub }: SubmenuProps) {
  const navigate = useNavigate();
  
  if (!hub.subs?.length) return null;
  
  return (
    <nav className="flex gap-2 sm:gap-3 overflow-x-auto" role="tablist">
      {hub.subs.map(sub => (
        <Button
          key={sub.slug}
          role="tab"
          aria-selected={sub.slug === activeSub}
          variant={sub.slug === activeSub ? "default" : "outline"}
          className="whitespace-nowrap"
          onClick={() => {
            const params = new URLSearchParams();
            params.set("cat", hub.slug);
            params.set("sub", sub.slug);
            navigate(`/dashboard?${params.toString()}`);
          }}
        >
          {sub.icon && <span className="mr-1">{sub.icon}</span>}
          {sub.label}
        </Button>
      ))}
    </nav>
  );
}