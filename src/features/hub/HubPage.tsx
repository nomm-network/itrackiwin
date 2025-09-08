import { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import HubLayout from "./HubLayout";
import HeaderRow from "./HeaderRow";
import SubcategoryMenu from "./SubcategoryMenu";
import { useHubMeta } from "./useHubMeta";
import { resolveHealthBody } from "./bodyResolver";

export default function HubPage() {
  const hub = useHubMeta("health");               // loads Health + subs from DB
  const [sp] = useSearchParams();
  if (!hub) return null;

  // pick from URL; if invalid, fall back to first sub; if still nothing, default to 'fitness-exercise'
  const urlSub = (sp.get("sub") || "").toLowerCase();
  const validSet = new Set(hub.subs.map(s => s.slug.toLowerCase()));
  const active = validSet.has(urlSub)
    ? urlSub
    : (hub.subs[0]?.slug?.toLowerCase() || "fitness-exercise");

  const Body = resolveHealthBody(active);

  if (process.env.NODE_ENV !== "production") {
    console.debug("[HubPage] active =", active, "valid =", [...validSet]);
  }

  return (
    <HubLayout
      Header={<HeaderRow title="Dashboard" />}
      SubMenu={<SubcategoryMenu hub={hub} />}
      Body={
        <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded" />}>
          <Body />
        </Suspense>
      }
    />
  );
}