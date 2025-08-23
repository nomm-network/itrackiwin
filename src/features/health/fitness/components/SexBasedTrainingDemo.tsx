import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SexSelector } from './SexSelector';
import { SexType } from '../hooks/useFitnessProfile.hook';
import { 
  getSexBasedTrainingConfig,
  applyVolumeBias,
  applyProgressionBias,
  getRestTime,
  getRepRange
} from '../utils/sexBasedTraining';

export const SexBasedTrainingDemo = () => {
  const [selectedSex, setSelectedSex] = useState<SexType>('male');
  const config = getSexBasedTrainingConfig(selectedSex);

  // Example volume calculations
  const baseVolumes = {
    upperBody: 16,
    lowerBody: 14,
    glutes: 8,
    chest: 6,
    arms: 8
  };

  const adjustedVolumes = {
    upperBody: applyVolumeBias(baseVolumes.upperBody, 'upperBody', selectedSex),
    lowerBody: applyVolumeBias(baseVolumes.lowerBody, 'lowerBody', selectedSex),
    glutes: applyVolumeBias(baseVolumes.glutes, 'glutes', selectedSex),
    chest: applyVolumeBias(baseVolumes.chest, 'chest', selectedSex),
    arms: applyVolumeBias(baseVolumes.arms, 'arms', selectedSex)
  };

  // Example progression calculations
  const baseProgression = 2.5; // kg per week
  const strengthProgression = applyProgressionBias(baseProgression, 'strength', selectedSex);
  const hypertrophyProgression = applyProgressionBias(baseProgression, 'hypertrophy', selectedSex);

  // Rest times
  const compoundRest = getRestTime('compound', selectedSex);
  const isolationRest = getRestTime('isolation', selectedSex);

  // Rep ranges
  const strengthRange = getRepRange('strength', selectedSex);
  const hypertrophyRange = getRepRange('hypertrophy', selectedSex);
  const enduranceRange = getRepRange('endurance', selectedSex);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Sex-Based Training Personalization</h2>
        <p className="text-muted-foreground">
          See how biological sex influences training recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Biological Sex</CardTitle>
        </CardHeader>
        <CardContent>
          <SexSelector
            value={selectedSex}
            onChange={setSelectedSex}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Volume Distribution
              <Badge variant="outline">{selectedSex.replace('_', ' ')}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium">Upper Body</div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base: {baseVolumes.upperBody} sets/week</span>
                    <span className={adjustedVolumes.upperBody > baseVolumes.upperBody ? 'text-green-600' : adjustedVolumes.upperBody < baseVolumes.upperBody ? 'text-orange-600' : ''}>
                      {adjustedVolumes.upperBody} sets/week
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="font-medium">Lower Body</div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base: {baseVolumes.lowerBody} sets/week</span>
                    <span className={adjustedVolumes.lowerBody > baseVolumes.lowerBody ? 'text-green-600' : adjustedVolumes.lowerBody < baseVolumes.lowerBody ? 'text-orange-600' : ''}>
                      {adjustedVolumes.lowerBody} sets/week
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="font-medium">Glutes</div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base: {baseVolumes.glutes} sets/week</span>
                    <span className={adjustedVolumes.glutes > baseVolumes.glutes ? 'text-green-600' : adjustedVolumes.glutes < baseVolumes.glutes ? 'text-orange-600' : ''}>
                      {adjustedVolumes.glutes} sets/week
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="font-medium">Chest</div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base: {baseVolumes.chest} sets/week</span>
                    <span className={adjustedVolumes.chest > baseVolumes.chest ? 'text-green-600' : adjustedVolumes.chest < baseVolumes.chest ? 'text-orange-600' : ''}>
                      {adjustedVolumes.chest} sets/week
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progression & Recovery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Weekly Progression</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Strength Focus:</span>
                    <span>{strengthProgression.toFixed(2)} kg/week</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hypertrophy Focus:</span>
                    <span>{hypertrophyProgression.toFixed(2)} kg/week</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Rest Times</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Compound Exercises:</span>
                    <span>{Math.round(compoundRest / 60)} min {compoundRest % 60}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Isolation Exercises:</span>
                    <span>{Math.round(isolationRest / 60)} min {isolationRest % 60}s</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rep Ranges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Strength:</span>
                <span>{strengthRange[0]}-{strengthRange[1]} reps</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Hypertrophy:</span>
                <span>{hypertrophyRange[0]}-{hypertrophyRange[1]} reps</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Endurance:</span>
                <span>{enduranceRange[0]}-{enduranceRange[1]} reps</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Biases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Strength Focus:</span>
                  <span>{config.progressionBias.strength}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Hypertrophy Focus:</span>
                  <span>{config.progressionBias.hypertrophy}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Endurance Focus:</span>
                  <span>{config.progressionBias.endurance}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Recovery Multiplier:</span>
                  <span>{config.progressionBias.recovery}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Complex Programs:</span>
                  <span>{config.volumeBias.upperBody > 1 ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Research Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Male biases:</strong> Higher upper body muscle mass, greater strength gains, shorter recovery times
            </p>
            <p>
              <strong>Female biases:</strong> Greater glute activation potential, better endurance capacity, benefits from higher training volumes
            </p>
            <p>
              <strong>Neutral approach:</strong> Balanced programming without sex-specific assumptions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};