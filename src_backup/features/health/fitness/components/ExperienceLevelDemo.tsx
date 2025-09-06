import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExperienceLevelSelector } from './ExperienceLevelSelector';
import { useExperienceLevelConfig } from '../hooks/useExperienceLevelConfigs.hook';

type ExperienceLevelType = "new" | "returning" | "intermediate" | "advanced" | "very_experienced";

export const ExperienceLevelDemo = () => {
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevelType>('new');
  const { data: config, isLoading } = useExperienceLevelConfig(selectedLevel);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Experience Level System</h2>
        <p className="text-muted-foreground">
          See how different experience levels affect training parameters
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Your Experience Level</CardTitle>
        </CardHeader>
        <CardContent>
          <ExperienceLevelSelector
            value={selectedLevel}
            onChange={(level) => setSelectedLevel(level as ExperienceLevelType)}
          />
        </CardContent>
      </Card>

      {!isLoading && config && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Training Parameters
              <Badge variant="outline">{selectedLevel.replace('_', ' ')}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Intensity Range</h4>
                <p className="text-sm text-muted-foreground">
                  {Math.round(config.start_intensity_low * 100)}% - {Math.round(config.start_intensity_high * 100)}%
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Warmup Sets</h4>
                <p className="text-sm text-muted-foreground">
                  {config.warmup_set_count_min} - {config.warmup_set_count_max} sets
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Rest Time</h4>
                <p className="text-sm text-muted-foreground">
                  {Math.round(config.main_rest_seconds_min / 60)} - {Math.round(config.main_rest_seconds_max / 60)} minutes
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Weekly Progress</h4>
                <p className="text-sm text-muted-foreground">
                  +{Math.round(config.weekly_progress_pct * 100)}% per week
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Complex Programs</h4>
                <p className="text-sm text-muted-foreground">
                  {config.allow_high_complexity ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};