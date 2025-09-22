import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MuscleGroupPicker } from './MuscleGroupPicker';
import { useMusclePriorities } from '../hooks/useMusclePriorities.hook';
import { 
  generatePriorityWeightMap,
  calculateTotalPrioritizedVolume,
  getMusclePrioritySummary
} from '../services/musclePriorityService';

export const MuscleGroupPriorityDemo = () => {
  const { data: priorities = [] } = useMusclePriorities();

  // Example base volumes for demonstration
  const baseVolumes = {
    chest: 12,
    back: 14,
    shoulders: 10,
    quadriceps: 16,
    hamstrings: 12,
    biceps: 8,
    triceps: 8,
    abs: 6
  };

  const weightMap = generatePriorityWeightMap(priorities);
  const adjustedVolumes = calculateTotalPrioritizedVolume(baseVolumes, priorities);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Muscle Group Priority System</h2>
        <p className="text-muted-foreground">
          Set your muscle group priorities and see how they affect your training volume
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Picker */}
        <div>
          <MuscleGroupPicker />
        </div>

        {/* Results Dashboard */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority Weight Map</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(weightMap).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(weightMap).map(([muscle, multiplier]) => (
                    <div key={muscle} className="flex justify-between items-center text-sm">
                      <span className="capitalize">{muscle}:</span>
                      <Badge variant="outline">
                        {multiplier}x volume
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No priorities set yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volume Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(baseVolumes).map(([muscle, baseVolume]) => {
                  const adjustedVolume = adjustedVolumes[muscle];
                  const summary = getMusclePrioritySummary(muscle, priorities);
                  const isAdjusted = baseVolume !== adjustedVolume;

                  return (
                    <div
                      key={muscle}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isAdjusted ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="capitalize font-medium text-sm">
                          {muscle}
                        </span>
                        {summary.isPrioritized && (
                          <Badge variant="secondary" className="text-xs">
                            {summary.description}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {baseVolume} sets
                        </span>
                        <span>→</span>
                        <span className={isAdjusted ? 'font-medium text-primary' : ''}>
                          {adjustedVolume} sets/week
                        </span>
                        {isAdjusted && (
                          <Badge variant="outline" className="text-xs">
                            +{adjustedVolume - baseVolume}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• <strong>Personalized Focus:</strong> Direct training towards your goals</div>
                <div>• <strong>Volume Optimization:</strong> Automatically adjust weekly sets</div>
                <div>• <strong>Exercise Selection:</strong> Prioritize movements for target muscles</div>
                <div>• <strong>Progress Tracking:</strong> Monitor prioritized muscle development</div>
                <div>• <strong>Progression Rates:</strong> Faster advancement in focus areas</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};