import { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import HeaderRow from "./HeaderRow";
import SubcategoryChips from "./SubcategoryChips";
import { useHubMeta } from "./useHubMeta";
import { resolveBodyByCategory } from "./bodyResolver";

export default function HubPage() {
  const [sp] = useSearchParams();
  const cat = (sp.get("cat") || "health").toLowerCase();
  const urlSub = (sp.get("sub") || "").toLowerCase();

  // 🚀 now dynamic by category
  const hub = useHubMeta(cat);
  if (!hub) return null;

  const validSubs = new Set(hub.subs.map((s) => s.slug));
  const activeSub = validSubs.has(urlSub)
    ? urlSub
    : (hub.subs[0]?.slug || "fitness-exercise");

  // category-aware body resolver
  const Body = resolveBodyByCategory(hub.slug, activeSub);

  return (
    <div className="container mx-auto p-2 sm:p-6 space-y-2 sm:space-y-6 pb-20 md:pb-6">
      <HeaderRow hub={hub} />
      <SubcategoryChips hubSlug={hub.slug} chips={hub.subs} />
      <Suspense fallback={null}>
        <Body />
      </Suspense>
    </div>
  );
}