import { Suspense, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CATEGORY_REGISTRY } from "./categoryRegistry";
import { SimpleErrorBoundary as ErrorBoundary } from "@/components/util/SimpleErrorBoundary";

function useCategorySelection() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();

  const catKey = sp.get("cat") ?? "health.fitness";
  const cat = useMemo(
    () => CATEGORY_REGISTRY.find(c => c.key === catKey) ?? CATEGORY_REGISTRY[0],
    [catKey]
  );

  const requestedSub = sp.get("sub");
  const sub = cat.sub.find(s => s.key === requestedSub) ?? cat.sub.find(s => s.key === cat.defaultSubKey)!;

  // normalize URL if needed
  if (!requestedSub || requestedSub !== sub.key) {
    const next = new URLSearchParams(sp);
    next.set("cat", cat.key);
    next.set("sub", sub.key);
    setSp(next, { replace: true });
  }

  function setCat(newCatKey: string) {
    const nextCat = CATEGORY_REGISTRY.find(c => c.key === newCatKey) ?? CATEGORY_REGISTRY[0];
    const next = new URLSearchParams(sp);
    next.set("cat", nextCat.key);
    next.set("sub", nextCat.defaultSubKey);
    navigate(`/dashboard?${next.toString()}`, { replace: true });
  }

  function setSub(newSubKey: string) {
    const next = new URLSearchParams(sp);
    next.set("sub", newSubKey);
    navigate(`/dashboard?${next.toString()}`, { replace: true });
  }

  return { cat, sub, setCat, setSub };
}

export default function DynamicDashboardPage() {
  const { cat, sub, setCat, setSub } = useCategorySelection();
  const View = sub.component;

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-rows-[auto_auto_1fr]">
        <CategoryStrip activeKey={cat.key} onChange={setCat} />
        <Submenu items={cat.sub} activeKey={sub.key} onChange={setSub} />
        <div className="p-4">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading {cat.label} · {sub.label}…</div>
              </div>
            }>
              <View />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

function CategoryStrip({activeKey, onChange}:{activeKey:string; onChange:(k:string)=>void}) {
  return (
    <nav className="flex gap-2 p-3 border-b bg-card overflow-x-auto">
      {CATEGORY_REGISTRY.map(c => (
        <button
          key={c.key}
          onClick={()=>onChange(c.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            c.key === activeKey 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={c.key===activeKey}
        >
          {c.label}
        </button>
      ))}
    </nav>
  );
}

function Submenu({items, activeKey, onChange}:{items:{key:string;label:string;}[]; activeKey:string; onChange:(k:string)=>void}) {
  return (
    <nav className="flex gap-2 p-2 border-b bg-muted/30 overflow-x-auto">
      {items.map(i => (
        <button
          key={i.key}
          onClick={()=>onChange(i.key)}
          className={`px-3 py-1.5 rounded text-sm transition-colors whitespace-nowrap ${
            i.key === activeKey 
              ? "bg-background text-foreground font-medium shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
          aria-pressed={i.key===activeKey}
        >
          {i.label}
        </button>
      ))}
    </nav>
  );
}