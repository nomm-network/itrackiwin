// src/features/hub/configureResolver.ts
import WealthConfigure     from "@/features/hub/bodies/wealth/WealthConfigureBody";
import RelationshipsConfigure from "@/features/hub/bodies/relationships/RelationshipsConfigureBody";
import MindConfigure       from "@/features/hub/bodies/mind/MindConfigureBody";
import PurposeConfigure    from "@/features/hub/bodies/purpose/PurposeConfigureBody";
import LifestyleConfigure  from "@/features/hub/bodies/lifestyle/LifestyleConfigureBody";

// Fallback renders a friendly "No settings yet" stub
import GenericConfigureStub from "@/features/hub/bodies/common/GenericConfigureStub";

const CONFIGURE_BY_CATEGORY: Record<string, React.ComponentType<any>> = {
  wealth:         WealthConfigure,
  relationships:  RelationshipsConfigure,
  mind:           MindConfigure,
  purpose:        PurposeConfigure,
  lifestyle:      LifestyleConfigure,
};

export function resolveConfigureBody(catSlug: string) {
  return CONFIGURE_BY_CATEGORY[catSlug?.toLowerCase()] ?? GenericConfigureStub;
}