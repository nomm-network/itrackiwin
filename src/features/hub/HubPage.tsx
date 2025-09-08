import { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import HubLayout from "./HubLayout";
import HeaderRow from "./HeaderRow";
import SubcategoryMenu from "./SubcategoryMenu";
import { useHubMeta } from "./useHubMeta";
import { resolveHealthBody } from "./bodyResolver";

export default function HubPage() {
  const hub = useHubMeta("health");   // this page = Health hub
  const [sp] = useSearchParams();

  if (!hub) return null;

  const active = (sp.get("sub") ?? hub.subs[0]?.slug ?? "fitness-exercise").toLowerCase();
  console.log("🔍 Hub subs:", hub.subs);
  console.log("🔍 URL sub param:", sp.get("sub"));
  console.log("🔍 Active sub slug:", active);
  console.log("🔍 First sub slug:", hub.subs[0]?.slug);
  const Body = resolveHealthBody(active);
  const __name = Body.name || "anonymous";
  console.debug("[HubPage] Resolving to component:", __name);

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