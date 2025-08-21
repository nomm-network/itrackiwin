import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Calculator, Zap } from 'lucide-react';
import VoiceInput from './VoiceInput';
import QuickEntryPad from './QuickEntryPad';
import MetricVisualization from './MetricVisualization';
import { ExerciseMetricDef } from '@/features/fitness/hooks/useMetrics';

interface EnhancedMetricsFormProps {
  metrics: ExerciseMetricDef[];
  values: Record<string, any>;
  onValuesChange: (values: Record<string, any>) => void;
  exerciseHistory?: any[];
  className?: string;
}

const EnhancedMetricsForm: React.FC<EnhancedMetricsFormProps> = ({
  metrics,
  values,
  onValuesChange,
  exerciseHistory = [],
  className
}) => {
  const [activeTab, setActiveTab] = useState('quick');

  const handleVoiceResult = (text: string) => {
    // Parse voice input for common patterns
    const patterns = [
      /(\d+\.?\d*)\s*(?:kg|kilos?|pounds?|lbs?)/i,
      /(\d+)\s*(?:reps?|repetitions?)/i,
      /(\d+)\s*(?:sets?)/i,
      /(\d+\.?\d*)\s*(?:seconds?|mins?|minutes?)/i
    ];

    const updates: Record<string, any> = {};

    patterns.forEach((pattern, index) => {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        switch (index) {
          case 0: // Weight
            const weightMetric = metrics.find(m => 
              m.metric_def?.key.includes('weight') || 
              m.metric_def?.label.toLowerCase().includes('weight')
            );
            if (weightMetric) updates[weightMetric.id] = value;
            break;
          case 1: // Reps
            const repsMetric = metrics.find(m => 
              m.metric_def?.key.includes('reps') || 
              m.metric_def?.label.toLowerCase().includes('reps')
            );
            if (repsMetric) updates[repsMetric.id] = value;
            break;
          case 2: // Sets
            const setsMetric = metrics.find(m => 
              m.metric_def?.key.includes('sets') || 
              m.metric_def?.label.toLowerCase().includes('sets')
            );
            if (setsMetric) updates[setsMetric.id] = value;
            break;
          case 3: // Duration
            const durationMetric = metrics.find(m => 
              m.metric_def?.key.includes('duration') || 
              m.metric_def?.label.toLowerCase().includes('duration') ||
              m.metric_def?.label.toLowerCase().includes('time')
            );
            if (durationMetric) updates[durationMetric.id] = value;
            break;
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      onValuesChange({ ...values, ...updates });
    }
  };

  const handleQuickEntry = (weight: number, reps: number) => {
    const updates: Record<string, any> = {};
    
    const weightMetric = metrics.find(m => 
      m.metric_def?.key.includes('weight') || 
      m.metric_def?.label.toLowerCase().includes('weight')
    );
    const repsMetric = metrics.find(m => 
      m.metric_def?.key.includes('reps') || 
      m.metric_def?.label.toLowerCase().includes('reps')
    );

    if (weightMetric) updates[weightMetric.id] = weight;
    if (repsMetric) updates[repsMetric.id] = reps;

    onValuesChange({ ...values, ...updates });
  };

  const getLastValues = () => {
    if (exerciseHistory.length === 0) return { lastWeight: 0, lastReps: 0 };
    
    const lastSet = exerciseHistory[exerciseHistory.length - 1];
    return {
      lastWeight: lastSet?.weight || 0,
      lastReps: lastSet?.reps || 0
    };
  };

  const getMetricHistory = (metricId: string) => {
    // Transform exercise history into metric visualization data
    return exerciseHistory.slice(-10).map((set, index) => ({
      date: new Date(set.date || Date.now()).toLocaleDateString(),
      value: set[metricId] || 0
    }));
  };

  if (metrics.length === 0) {
    return null;
  }

  const { lastWeight, lastReps } = getLastValues();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Exercise Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick" className="text-xs">
              <Zap className="h-4 w-4 mr-1" />
              Quick
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs">
              <Mic className="h-4 w-4 mr-1" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-xs">
              <Calculator className="h-4 w-4 mr-1" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            <QuickEntryPad
              onSubmit={handleQuickEntry}
              lastWeight={lastWeight}
              lastReps={lastReps}
            />
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <VoiceInput
              onResult={handleVoiceResult}
              placeholder="Say something like '10 reps at 50 kilos'"
            />
            
            {/* Current Values Display */}
            <div className="grid grid-cols-2 gap-2">
              {metrics.slice(0, 4).map((metric) => {
                const value = values[metric.id];
                if (!value) return null;
                
                return (
                  <Badge key={metric.id} variant="secondary" className="justify-center">
                    {metric.metric_def?.label}: {value} {metric.metric_def?.unit}
                  </Badge>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((metric) => {
                const metricDef = metric.metric_def;
                if (!metricDef || metricDef.value_type === 'boolean') return null;

                const currentValue = values[metric.id] ?? metric.default_value ?? '';
                const label = metricDef.unit ? `${metricDef.label} (${metricDef.unit})` : metricDef.label;

                return (
                  <div key={metric.id} className="space-y-1">
                    <Label htmlFor={`metric-${metric.id}`} className="text-xs">
                      {label}
                      {metric.is_required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={`metric-${metric.id}`}
                      type={metricDef.value_type === 'integer' ? 'number' : 'text'}
                      step={metricDef.value_type === 'numeric' ? '0.01' : '1'}
                      placeholder={metricDef.label}
                      value={currentValue}
                      onChange={(e) => onValuesChange({
                        ...values,
                        [metric.id]: e.target.value
                      })}
                      required={metric.is_required}
                      inputMode={metricDef.value_type === 'numeric' ? 'decimal' : 'numeric'}
                      className="text-center"
                    />
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Metric Visualizations */}
        {exerciseHistory.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium">Progress Overview</h4>
            <div className="grid gap-3">
              {metrics.slice(0, 2).map((metric) => {
                const historyData = getMetricHistory(metric.id);
                if (historyData.every(d => d.value === 0)) return null;

                return (
                  <MetricVisualization
                    key={metric.id}
                    title={metric.metric_def?.label || 'Metric'}
                    data={historyData}
                    unit={metric.metric_def?.unit}
                    type="line"
                  />
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedMetricsForm;