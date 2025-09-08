import { useSearchParams } from "react-router-dom";
import { TIPS_BY_SLUG } from "./tips-data";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TipsBody({ slug }: { slug?: string }) {
  const [searchParams] = useSearchParams();
  
  // If no slug is provided, get it from URL
  const effectiveSlug = slug || searchParams.get("sub") || "";
  
  // Handle case where slug might be undefined or empty
  if (!effectiveSlug) {
    return (
      <div className="container mx-auto p-2 sm:p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Coming Soon</CardTitle>
            <p className="text-muted-foreground">
              This module is under construction. Check back soon for helpful tips and best practices.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const entry = TIPS_BY_SLUG[effectiveSlug.toLowerCase()];
  
  if (!entry) {
    return (
      <div className="container mx-auto p-2 sm:p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Coming Soon</CardTitle>
            <p className="text-muted-foreground">
              This module is under construction. Check back soon for helpful tips and best practices.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{entry.title}</CardTitle>
          <p className="text-muted-foreground">
            This module is under construction, but here are the top 10 best practices you can start using right away.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entry.tips.map((tip, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}