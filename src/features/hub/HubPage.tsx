import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HeaderRow from "./HeaderRow";
import SubcategoryChips from "./SubcategoryChips";
import { useHubMeta } from "./useHubMeta";
import { resolveBodyByCategory } from "./bodyResolver";

export default function HubPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const cat = (sp.get("cat") || "health").toLowerCase();
  const urlSub = (sp.get("sub") || "").toLowerCase();

  // 🚀 now dynamic by category
  const hub = useHubMeta(cat);
  if (!hub) return null;

  // Memoize validSubs to prevent unnecessary re-renders
  const validSubs = useMemo(() => new Set(hub.subs.map((s) => s.slug)), [hub.subs]);
  
  const activeSub = validSubs.has(urlSub)
    ? urlSub
    : (hub.subs[0]?.slug || "");

  // Redirect to correct subcategory if current one is invalid
  useEffect(() => {
    if (urlSub && !validSubs.has(urlSub) && hub.subs[0]?.slug) {
      console.log("Redirecting from invalid sub:", urlSub, "to:", hub.subs[0].slug);
      navigate(`/dashboard?cat=${cat}&sub=${hub.subs[0].slug}`, { replace: true });
    }
  }, [urlSub, cat, hub.subs, navigate]); // Removed validSubs from deps to prevent loops

  // category-aware body resolver
  const Body = resolveBodyByCategory(hub.slug, activeSub);

  // Add safety check for Body component
  if (!Body || typeof Body !== 'function') {
    console.error("Invalid Body component:", Body);
    return <div>Error loading content</div>;
  }

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