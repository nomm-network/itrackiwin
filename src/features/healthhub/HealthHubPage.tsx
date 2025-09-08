import { Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HealthHubLayout from "./HealthHubLayout";
import HubCategoryGrid from "./components/HubCategoryGrid";
import Submenu from "./components/Submenu";
import { useHubCategories, findHub, getDefaultSubcategory } from "./useHubCategories";
import { resolveView } from "./moduleMap";
import { useUserRole } from "@/hooks/useUserRole";

// Placeholder components for KPIs and Quick Actions
function PlaceholderKPIs({ hubSlug }: { hubSlug: string }) {
  const kpiData = getKPIDataForHub(hubSlug);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
      {kpiData.map((kpi, index) => (
        <div key={index} className="bg-card p-3 rounded-lg border">
          <div className="text-sm text-muted-foreground">{kpi.label}</div>
          <div className="text-lg font-semibold">{kpi.value}</div>
        </div>
      ))}
    </div>
  );
}

function PlaceholderQuick() {
  return (
    <Card>
      <CardContent className="pt-3 sm:pt-6">
        <h3 className="text-lg font-semibold mb-2 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <Button variant="outline" className="h-12 flex items-center gap-2">
            <span className="text-xs">Coming Soon</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getKPIDataForHub(hubSlug: string) {
  switch (hubSlug) {
    case 'health':
      return [
        { label: "Workouts (7d)", value: "5/7" },
        { label: "Sleep Average", value: "7h 32m" },
        { label: "Nutrition Score", value: "8.2/10" },
        { label: "Energy Level", value: "Good" }
      ];
    case 'relationships':
      return [
        { label: "Connections/week", value: "12" },
        { label: "Quality Time", value: "8h" },
        { label: "Check-ins", value: "5/7" },
        { label: "Relationship Health", value: "Strong" }
      ];
    case 'wealth':
      return [
        { label: "Monthly Savings", value: "$1,200" },
        { label: "Investment Return", value: "+12.4%" },
        { label: "Budget Status", value: "On Track" },
        { label: "Financial Score", value: "8.5/10" }
      ];
    case 'mind':
      return [
        { label: "Learning Streak", value: "14 days" },
        { label: "Books Read", value: "18/24" },
        { label: "Skills Progress", value: "75%" },
        { label: "Goal Achievement", value: "12/15" }
      ];
    case 'lifestyle':
      return [
        { label: "Habit Streaks", value: "4 active" },
        { label: "Productivity", value: "85%" },
        { label: "Mindfulness", value: "20 min/day" },
        { label: "Life Balance", value: "Good" }
      ];
    default:
      return [
        { label: "Progress", value: "Coming Soon" },
        { label: "Goals", value: "Set Up" },
        { label: "Streak", value: "Start Today" },
        { label: "Score", value: "Track More" }
      ];
  }
}

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
      Submenu={<Submenu hub={hub} activeSub={subSlug} />}
      KPIs={<PlaceholderKPIs hubSlug={hub.slug} />}
      Primary={
        <Suspense fallback={<Card><CardContent className="p-6">Loading…</CardContent></Card>}>
          <View />
        </Suspense>
      }
      Quick={<PlaceholderQuick />}
    />
  );
}
