import { Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HealthHubLayout from "./HealthHubLayout";
import HubCategoryGrid from "./components/HubCategoryGrid";
import { useHubCategories, findHub, getDefaultSubcategory } from "./useHubCategories";
import { resolveView } from "./moduleMap";
import { useUserRole } from "@/hooks/useUserRole";
import QuickActionsRow from "./fitness/QuickActionsRow";

export default function HealthHubPage() {
  const { data: hubs, isLoading, error } = useHubCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useUserRole();

  if (isLoading) {
    return (
      <div className="container mx-auto p-2 sm:p-6 space-y-2 sm:space-y-6 pb-20 md:pb-6">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !hubs?.length) {
    return (
      <div className="container mx-auto p-2 sm:p-6 space-y-2 sm:space-y-6 pb-20 md:pb-6">
        <div className="text-center text-muted-foreground">
          Failed to load categories. Please try again.
        </div>
      </div>
    );
  }

  const hubSlug = searchParams.get("cat") || hubs[0]?.slug || "health";
  const hub = findHub(hubs, hubSlug);
  
  if (!hub) {
    // Redirect to first available hub
    const firstHub = hubs[0];
    const defaultSub = getDefaultSubcategory(firstHub);
    const params = new URLSearchParams();
    params.set("cat", firstHub.slug);
    if (defaultSub) {
      params.set("sub", defaultSub);
    }
    setSearchParams(params, { replace: true });
    return null;
  }

  let subSlug = searchParams.get("sub") || getDefaultSubcategory(hub);
  
  // Normalize subcategory if it doesn't exist for this hub
  if (subSlug && !hub.subs.some(s => s.slug === subSlug)) {
    subSlug = getDefaultSubcategory(hub);
    const params = new URLSearchParams(searchParams);
    if (subSlug) {
      params.set("sub", subSlug);
    } else {
      params.delete("sub");
    }
    setSearchParams(params, { replace: true });
  }

  const View = resolveView(hub.slug, subSlug || undefined);

  return (
    <HealthHubLayout
      Header={
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">{hub.label} Hub</h1>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Button 
                variant="default" 
                onClick={() => navigate('/admin')}
                className="text-sm"
              >
                Admin
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/explore')}
              className="text-sm"
            >
              All Categories
            </Button>
          </div>
        </div>
      }
      CategoryGrid={<HubCategoryGrid hub={hub} activeSub={subSlug} />}
      Primary={
        <Suspense fallback={<Card><CardContent className="p-6">Loading…</CardContent></Card>}>
          <View />
        </Suspense>
      }
      Quick={<QuickActionsRow />}
    />
  );
}
