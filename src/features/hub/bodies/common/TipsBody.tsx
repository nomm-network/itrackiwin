import { TIPS_BY_SLUG } from "../../tips-data";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = { category: string; subSlug: string };

export default function TipsBody({ category, subSlug }: Props) {
  // Use the subcategory slug to get specific tips
  const entry = TIPS_BY_SLUG[subSlug.toLowerCase()];
  
  if (!entry) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Coming Soon</CardTitle>
          <p className="text-muted-foreground">
            This module is under construction. Check back soon for helpful tips and best practices.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
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
  );
}