import React, { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import HeaderRow from "./HeaderRow";
import SubcategoryChips from "./SubcategoryChips";
import { useHubMeta } from "./useHubMeta";
import { resolveBody } from "./bodyResolver";

export default function HubPage() {
  const [searchParams] = useSearchParams();
  const cat = (searchParams.get("cat") || "health").toLowerCase();
  const meta = useHubMeta(cat);

  // choose active sub; fallback to first; fallback to fitness-exercise
  const urlSub = (searchParams.get("sub") || "").toLowerCase();
  const valid = new Set(meta.chips.map(c => c.slug.toLowerCase()));
  const active = valid.has(urlSub)
    ? urlSub
    : (meta.chips[0]?.slug?.toLowerCase() || "fitness-exercise");

  const Body = resolveBody(active);

  return (
    <div className="container mx-auto p-2 sm:p-6 space-y-2 sm:space-y-6 pb-20 md:pb-6">
      <HeaderRow />
      <SubcategoryChips hubSlug={meta.slug} chips={meta.chips} />
      <Suspense fallback={null}>
        <Body />
      </Suspense>
    </div>
  );
}