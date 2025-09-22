import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, RefreshCw, Check, ArrowRight, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  findAlternatives, 
  saveExercisePreference,
  type ExerciseAlternative,
  type ExerciseConstraints 
} from '../services/exerciseSubstitution.service';
import { useEquipmentCapabilities } from '../hooks/useEquipmentCapabilities.hook';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ExerciseSwapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: {
    id: string;
    name: string;
    slug: string;
  };
  templateId?: string;
  userId: string;
  onSwapConfirmed?: (originalId: string, newId: string) => void;
}

export function ExerciseSwapDialog({
  isOpen,
  onClose,
  exercise,
  templateId,
  userId,
  onSwapConfirmed
}: ExerciseSwapDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlternative, setSelectedAlternative] = useState<ExerciseAlternative | null>(null);
  const [constraints, setConstraints] = useState<ExerciseConstraints>({});
  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();
  const { data: equipmentCaps } = useEquipmentCapabilities(userId);

  // Fetch alternatives
  const { data: alternatives = [], isLoading: isLoadingAlternatives, refetch } = useQuery({
    queryKey: ['exercise-alternatives', exercise.id, constraints],
    queryFn: () => findAlternatives(exercise.id, equipmentCaps!, undefined, constraints),
    enabled: !!equipmentCaps && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Save preference mutation
  const savePreferenceMutation = useMutation({
    mutationFn: async (preferredExerciseId: string) => {
      if (!templateId) throw new Error('Template ID required');
      await saveExercisePreference(userId, templateId, exercise.id, preferredExerciseId);
    },
    onSuccess: (_, preferredExerciseId) => {
      toast.success('Exercise preference saved');
      onSwapConfirmed?.(exercise.id, preferredExerciseId);
      queryClient.invalidateQueries({ queryKey: ['exercise-preferences'] });
      onClose();
    },
    onError: (error) => {
      console.error('Failed to save preference:', error);
      toast.error('Failed to save exercise preference');
    }
  });

  // Filter alternatives based on search
  const filteredAlternatives = alternatives.filter(alt =>
    alt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alt.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSwap = () => {
    if (selectedAlternative) {
      savePreferenceMutation.mutate(selectedAlternative.exerciseId);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedAlternative(null);
      setSearchTerm('');
      setShowFilters(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Swap Exercise: {exercise.name}
          </DialogTitle>
          <DialogDescription>
            Find and select a suitable alternative exercise based on muscle targets and available equipment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alternatives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoadingAlternatives}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingAlternatives ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <Collapsible open={showFilters}>
              <CollapsibleContent>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Filter Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Max Difficulty</Label>
                      <select
                        className="w-full mt-1 p-2 border rounded text-sm"
                        value={constraints.maxDifficulty || ''}
                        onChange={(e) => setConstraints(prev => ({
                          ...prev,
                          maxDifficulty: e.target.value as any || undefined
                        }))}
                      >
                        <option value="">Any difficulty</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Alternatives List */}
          <ScrollArea className="flex-1 h-[400px]">
            {isLoadingAlternatives ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredAlternatives.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No suitable alternatives found</p>
                <p className="text-xs">Try adjusting your filters or check your equipment setup</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlternatives.map((alternative) => (
                  <Card 
                    key={alternative.exerciseId}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedAlternative?.exerciseId === alternative.exerciseId 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : ''
                    }`}
                    onClick={() => setSelectedAlternative(alternative)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{alternative.name}</h4>
                            {selectedAlternative?.exerciseId === alternative.exerciseId && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {alternative.matchScore}% match
                            </Badge>
                            {alternative.equipment && (
                              <Badge variant="outline" className="text-xs">
                                {alternative.equipment.slug}
                              </Badge>
                            )}
                            {alternative.movementPattern && (
                              <Badge variant="outline" className="text-xs">
                                {alternative.movementPattern}
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <strong>Why it matches:</strong> {alternative.matchReasons.join(', ')}
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-primary">
                            {alternative.matchScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            compatibility
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selection Summary */}
          {selectedAlternative && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{exercise.name}</span>
                      <ArrowRight className="h-4 w-4" />
                      <span className="font-medium text-primary">{selectedAlternative.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedAlternative.matchScore}% compatibility • {selectedAlternative.matchReasons.join(', ')}
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">
                    Selected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSwap}
            disabled={!selectedAlternative || savePreferenceMutation.isPending}
          >
            {savePreferenceMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirm Swap
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}