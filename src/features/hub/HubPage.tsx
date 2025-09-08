import { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import HubLayout from "./HubLayout";
import HeaderRow from "./HeaderRow";
import SubcategoryMenu from "./SubcategoryMenu";
import { useHubMeta } from "./useHubMeta";
import { resolveBody } from "./bodyResolver";

export default function HubPage() {
  const hub = useHubMeta("health");   // this page = Health hub
  const [sp] = useSearchParams();

  if (!hub) return null;

  const sub = (sp.get("sub") ?? hub.subs[0]?.slug ?? "").toLowerCase();
  const Body = resolveBody(hub.slug, sub);

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