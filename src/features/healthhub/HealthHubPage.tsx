import { Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HealthHubLayout from "./HealthHubLayout";
import { CATEGORIES, findCategory } from "./categoryRegistry";
import HubCategoryGrid from "./components/HubCategoryGrid";
import { useUserRole } from "@/hooks/useUserRole";

function Submenu({ catKey, subKey }: { catKey: string; subKey: string }) {
  const nav = useNavigate();
  const cat = findCategory(catKey);
  
  return (
    <nav className="flex gap-2 sm:gap-3 overflow-x-auto" role="tablist">
      {cat.subs.map(s => (
        <Button
          key={s.key}
          role="tab"
          aria-selected={s.key === subKey}
          variant={s.key === subKey ? "default" : "outline"}
          className="whitespace-nowrap"
          onClick={() => nav(`/dashboard?cat=${encodeURIComponent(cat.key)}&sub=${encodeURIComponent(s.key)}`)}
        >
          {s.label}
        </Button>
      ))}
    </nav>
  );
}

export default function HealthHubPage() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const { isSuperAdmin } = useUserRole();

  const catKey = sp.get("cat") ?? "health.fitness";
  const cat = findCategory(catKey);

  let subKey = sp.get("sub") ?? cat.defaultSub;
  if (!cat.subs.some(s => s.key === subKey)) {
    // normalize to default sub (keeps URL clean)
    const N = new URLSearchParams(sp);
    N.set("sub", cat.defaultSub);
    setSp(N, { replace: true });
    subKey = cat.defaultSub;
  }

  const Sub = cat.subs.find(s => s.key === subKey)!.View;
  const Header = cat.Header;
  const KPIs = cat.KPIs;
  const Quick = cat.Quick;

  return (
    <HealthHubLayout
      Header={
        <div className="flex items-center justify-between">
          <Header />
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Button 
                variant="default" 
                onClick={() => nav('/admin')}
                className="text-sm"
              >
                Admin
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => nav('/explore')}
              className="text-sm"
            >
              All Categories
            </Button>
          </div>
        </div>
      }
      CategoryGrid={
        <HubCategoryGrid
          onSelect={(key: string) => {
            const c = findCategory(key);
            nav(`/dashboard?cat=${encodeURIComponent(c.key)}&sub=${encodeURIComponent(c.defaultSub)}`);
          }}
        />
      }
      Submenu={<Submenu catKey={cat.key} subKey={subKey} />}
      KPIs={<KPIs />}
      Primary={
        <Suspense fallback={<Card><CardContent className="p-6">Loading…</CardContent></Card>}>
          <Sub />
        </Suspense>
      }
      Quick={<Quick />}
    />
  );
}
