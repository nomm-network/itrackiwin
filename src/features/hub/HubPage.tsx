import { useSearchParams } from "react-router-dom";
import HubLayout from "./HubLayout";
import HeaderRow from "./HeaderRow";
import SubcategoryMenu from "./SubcategoryMenu";
import { useHubMeta } from "./useHubMeta";
import { resolveHealthBody } from "./bodyResolver";

export default function HubPage() {
  const hub = useHubMeta();
  const [sp] = useSearchParams();
  if (!hub) return null;

  const urlSub = (sp.get("sub") || "").toLowerCase();
  const valid = new Set(hub.subs.map(s => s.slug.toLowerCase()));
  const active = valid.has(urlSub) ? urlSub : (hub.subs[0]?.slug?.toLowerCase() || "fitness-exercise");
  console.debug("[HubPage] active sub =", active);
  const Body = resolveHealthBody(active);

  return (
    <HubLayout
      Header={<HeaderRow hub={hub} />}
      SubMenu={null}
      Body={<Body />}
    />
  );
}