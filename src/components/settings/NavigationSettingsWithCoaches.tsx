import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useUserCategorySettings } from '@/hooks/useUserCategorySettings';
import { useLifeCategories } from '@/hooks/useLifeCategoriesSimple';
import { useCoachesForCategory, useSelectCoach } from '@/hooks/useCoachSelection';

export function NavigationSettings() {
  const { categorySettings, isLoading: settingsLoading, toggleNavPin, isUpdating } = useUserCategorySettings();
  const { data: allCategories, isLoading: categoriesLoading } = useLifeCategories();
  const selectCoachMutation = useSelectCoach();
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

  const handleCoachSelection = async (categoryId: string, categorySlug: string, coachId: string | null) => {
    try {
      await selectCoachMutation.mutateAsync({ categoryId, coachId });
      toast.success('Coach updated successfully');
    } catch (error) {
      console.error('Failed to update coach:', error);
      toast.error('Failed to update coach selection');
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
          Choose which life categories appear in your bottom navigation and select your preferred coach for each.
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
          <div className="space-y-4">
            {allCategories?.map((category) => {
              const isPinned = getCategoryPinnedState(category.id);
              const isPending = category.id in pendingChanges;
              const canPin = pinnedCount < 3 || isPinned;

              return (
                <CategoryRow
                  key={category.id}
                  category={category}
                  isPinned={isPinned}
                  isPending={isPending}
                  canPin={canPin}
                  isUpdating={isUpdating}
                  onToggle={() => handleToggle(category.id, isPinned)}
                  onCoachSelect={(coachId) => handleCoachSelection(category.id, category.slug, coachId)}
                  isSelectingCoach={selectCoachMutation.isPending}
                />
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

interface CategoryRowProps {
  category: any;
  isPinned: boolean;
  isPending: boolean;
  canPin: boolean;
  isUpdating: boolean;
  onToggle: () => void;
  onCoachSelect: (coachId: string | null) => void;
  isSelectingCoach: boolean;
}

function CategoryRow({
  category,
  isPinned,
  isPending,
  canPin,
  isUpdating,
  onToggle,
  onCoachSelect,
  isSelectingCoach,
}: CategoryRowProps) {
  const { data: coaches, isLoading: coachesLoading } = useCoachesForCategory(
    isPinned ? category.slug : ''
  );

  const selectedCoach = coaches?.find(c => c.selected);
  const defaultCoach = coaches?.find(c => c.is_default);

  const handleCoachChange = (value: string) => {
    const coachId = value === 'default' ? null : value;
    const coach = coaches?.find(c => c.coach_id === coachId);
    
    // Check if coach requires subscription but user doesn't have access
    if (coach && !coach.has_access && !coach.is_default) {
      toast.error('Subscribe to unlock this coach.');
      return;
    }
    
    onCoachSelect(coachId);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
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
          onCheckedChange={onToggle}
        />
      </div>

      {/* Coach selection for pinned categories */}
      {isPinned && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Coach Selection:</label>
          
          {coachesLoading ? (
            <div className="text-sm text-muted-foreground">Loading coaches...</div>
          ) : coaches && coaches.length > 0 ? (
            <Select
              value={selectedCoach?.coach_id || 'default'}
              onValueChange={handleCoachChange}
              disabled={isSelectingCoach}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedCoach?.avatar_url || defaultCoach?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {(selectedCoach?.display_name || defaultCoach?.display_name || 'AI')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedCoach?.display_name || defaultCoach?.display_name || 'Default AI'}</span>
                    {selectedCoach?.type === 'ai' && <Zap className="h-3 w-3" />}
                    {selectedCoach?.type === 'human' && <Crown className="h-3 w-3" />}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-50 bg-background border shadow-md">
                {coaches.map((coach) => (
                  <SelectItem key={coach.coach_id} value={coach.coach_id} disabled={!coach.has_access && !coach.is_default}>
                    <div className="flex items-center gap-2 w-full">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={coach.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {coach.display_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1">{coach.display_name}</span>
                      <div className="flex items-center gap-1">
                        {coach.type === 'ai' && <Zap className="h-3 w-3 text-blue-500" />}
                        {coach.type === 'human' && <Crown className="h-3 w-3 text-purple-500" />}
                        {!coach.has_access && !coach.is_default && (
                          <Lock className="h-3 w-3 text-gray-400" />
                        )}
                        {coach.price_cents > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            ${(coach.price_cents / 100).toFixed(0)}/mo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
                {/* Default option */}
                <SelectItem value="default">
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">AI</AvatarFallback>
                    </Avatar>
                    <span className="flex-1">Default AI Coach</span>
                    <Zap className="h-3 w-3 text-blue-500" />
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-muted-foreground">No coaches available for this category</div>
          )}
        </div>
      )}
    </div>
  );
}