import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, Lightbulb, ArrowRight } from "lucide-react";

interface UnderConstructionProps {
  categorySlug: string;
  subcategorySlug?: string;
}

const CATEGORY_TIPS: Record<string, string[]> = {
  health: [
    "Track your workouts with the Fitness module",
    "Log your meals for better nutrition insights", 
    "Monitor your sleep patterns for optimal recovery",
    "Regular health checkups keep you on track"
  ],
  relationships: [
    "Schedule regular check-ins with friends and family",
    "Express gratitude to strengthen bonds",
    "Practice active listening in conversations",
    "Plan quality time activities together"
  ],
  wealth: [
    "Create a monthly budget and stick to it",
    "Set up automatic savings transfers",
    "Track your expenses to identify spending patterns",
    "Invest in skills that increase your earning potential"
  ],
  mind: [
    "Learn something new every day",
    "Practice mindfulness and meditation",
    "Set clear, achievable goals",
    "Read books in areas you want to grow"
  ],
  lifestyle: [
    "Build consistent daily routines",
    "Practice gratitude and mindfulness",
    "Maintain work-life balance",
    "Create productive habits that serve your goals"
  ]
};

const CATEGORY_NAMES: Record<string, string> = {
  health: "Health",
  relationships: "Relationships", 
  wealth: "Wealth",
  mind: "Personal Growth",
  lifestyle: "Lifestyle"
};

export default function UnderConstruction({ categorySlug, subcategorySlug }: UnderConstructionProps) {
  const categoryName = CATEGORY_NAMES[categorySlug] || categorySlug;
  const tips = CATEGORY_TIPS[categorySlug] || [
    "This module is being developed",
    "Check back soon for new features",
    "Use other available modules in the meantime"
  ];

  const title = subcategorySlug 
    ? `${categoryName} • ${subcategorySlug.charAt(0).toUpperCase() + subcategorySlug.slice(1)}`
    : `${categoryName} Hub`;

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Construction className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          This module is under construction and will be available soon.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Best Practices for {categoryName}
          </div>
          <div className="space-y-2">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.history.back()}
            className="w-full"
          >
            Back to Overview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}