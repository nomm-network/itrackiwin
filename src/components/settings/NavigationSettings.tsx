import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUserCategorySettings } from '@/hooks/useUserCategorySettings';
import { useLifeCategories } from '@/hooks/useLifeCategoriesSimple';

export function NavigationSettings() {
  const { categorySettings, isLoading: settingsLoading, toggleNavPin, isUpdating } = useUserCategorySettings();
  const { data: allCategories, isLoading: categoriesLoading } = useLifeCategories();
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});

  if (settingsLoading || categoriesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Navigation Settings</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleToggle = async (categoryId: string, currentlyPinned: boolean) => {
    const newPinned = !currentlyPinned;
    setPendingChanges(prev => ({ ...prev, [categoryId]: newPinned }));

    try {
      await toggleNavPin({ categoryId, pinned: newPinned });
      toast.success(`Category ${newPinned ? 'added to' : 'removed from'} bottom navigation`);
    } catch (error) {
      console.error('Failed to update navigation:', error);
      toast.error('Failed to update navigation settings');
    } finally {
      setPendingChanges(prev => {
        const { [categoryId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const getCategoryPinnedState = (categoryId: string) => {
    if (categoryId in pendingChanges) {
      return pendingChanges[categoryId];
    }
    const setting = categorySettings.find(s => s.category_id === categoryId);
    return setting?.nav_pinned || false;
  };

  const pinnedCount = allCategories?.filter(cat => getCategoryPinnedState(cat.id)).length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bottom Navigation Settings</CardTitle>
        <CardDescription>
          Choose which life categories appear in your bottom navigation. 
          You can pin up to 3 categories (Dashboard and Atlas are always shown).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fixed items info */}
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">Always shown:</p>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-muted rounded text-xs">🏠 Dashboard</span>
            <span className="px-2 py-1 bg-muted rounded text-xs">🌍 Atlas</span>
          </div>
        </div>

        {/* Dynamic categories */}
        <div>
          <p className="font-medium text-sm mb-3">Life Categories ({pinnedCount}/3):</p>
          <div className="space-y-3">
            {allCategories?.map((category) => {
              const isPinned = getCategoryPinnedState(category.id);
              const isPending = category.id in pendingChanges;
              const canPin = pinnedCount < 3 || isPinned;

              return (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{category.icon || '📊'}</span>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">/{category.slug}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isPinned}
                    disabled={(!canPin && !isPinned) || isPending || isUpdating}
                    onCheckedChange={() => handleToggle(category.id, isPinned)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {pinnedCount >= 3 && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            Maximum of 3 categories can be pinned. Unpin a category to add a different one.
          </div>
        )}
      </CardContent>
    </Card>
  );
}