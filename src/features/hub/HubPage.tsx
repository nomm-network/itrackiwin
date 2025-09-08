import { useSearchParams, useNavigate } from "react-router-dom";
import { useHubMeta } from "./useHubMeta";
import { resolveBodyByCategory } from "./bodyResolver";
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

export default function HubPage() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const { isSuperAdmin } = useUserRole();

  const cat = (sp.get("cat") || "health").toLowerCase();
  const sub = (sp.get("sub") || "").toLowerCase();

  const hub = useHubMeta(cat);
  if (!hub) return null;

  const validSubs = new Set(hub.subs.map((s) => s.slug));
  const activeSub = validSubs.has(sub)
    ? sub
    : hub.subs[0]?.slug || "fitness-exercise";

  const Body = resolveBodyByCategory(cat, activeSub);

  return (
    <div className="container mx-auto p-2 sm:p-6 space-y-2 sm:space-y-6 pb-20 md:pb-6">
      {/* Title row */}
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">{hub.name}</h1>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Button 
                variant="default" 
                onClick={() => nav('/admin')}
                className="text-sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => nav("/explore")}
              className="text-sm"
            >
              Explore by Planets
            </Button>
          </div>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your progress across all areas of life.
        </p>
      </div>

      {/* Chips from DB + Configure at the end */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {hub.subs.slice(0, 5).map((s) => {
          const isActive = s.slug === activeSub;
          return (
            <Button
              key={s.slug}
              variant={isActive ? "default" : "outline"}
              onClick={() =>
                setSp({ cat: cat, sub: s.slug }, { replace: true })
              }
              className="h-16 flex flex-col items-center gap-1 p-2"
            >
              <span className="text-lg">📋</span>
              <span className="text-xs leading-tight text-center">
                {s.label}
              </span>
            </Button>
          );
        })}
        {/* Configure button as 6th item */}
        <Button
          variant={activeSub === "configure" ? "default" : "outline"}
          onClick={() => setSp({ cat: cat, sub: "configure" }, { replace: true })}
          className="h-16 flex flex-col items-center gap-1 p-2"
        >
          <span className="text-lg">⚙️</span>
          <span className="text-xs leading-tight text-center">
            Configure
          </span>
        </Button>
      </div>

      {/* Body component */}
      <Body category={cat} subSlug={activeSub} />
    </div>
  );
}