import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Settings } from 'lucide-react';
import { ExerciseMetricDef } from '@/features/fitness/hooks/useMetrics';
import EnhancedMetricsForm from '@/components/mobile/EnhancedMetricsForm';
import { useIsMobile } from '@/hooks/use-mobile';

interface DynamicMetricsFormProps {
  metrics: ExerciseMetricDef[];
  values: Record<string, any>;
  onValuesChange: (values: Record<string, any>) => void;
  className?: string;
}

export const DynamicMetricsForm: React.FC<DynamicMetricsFormProps> = ({
  metrics,
  values,
  onValuesChange,
  className
}) => {
  const isMobile = useIsMobile();
  const [useEnhanced, setUseEnhanced] = useState(isMobile);

  // Mock exercise history for enhanced form
  const mockExerciseHistory = [
    { date: '2024-01-20', weight: 50, reps: 8 },
    { date: '2024-01-22', weight: 52.5, reps: 8 },
    { date: '2024-01-24', weight: 55, reps: 7 },
  ];
  const handleValueChange = (metricId: string, value: any) => {
    onValuesChange({
      ...values,
      [metricId]: value
    });
  };

  const renderMetricInput = (metric: ExerciseMetricDef) => {
    const metricDef = metric.metric_def;
    if (!metricDef) return null;

    const currentValue = values[metric.id] ?? metric.default_value ?? '';
    const label = metricDef.unit ? `${metricDef.label} (${metricDef.unit})` : metricDef.label;

    switch (metricDef.value_type) {
      case 'numeric':
        return (
          <div key={metric.id} className="space-y-1">
            <Label htmlFor={`metric-${metric.id}`} className="text-xs">
              {label}
              {metric.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={`metric-${metric.id}`}
              type="number"
              step="0.01"
              placeholder={metricDef.label}
              value={currentValue}
              onChange={(e) => handleValueChange(metric.id, e.target.value)}
              required={metric.is_required}
              inputMode="decimal"
            />
          </div>
        );

      case 'integer':
        return (
          <div key={metric.id} className="space-y-1">
            <Label htmlFor={`metric-${metric.id}`} className="text-xs">
              {label}
              {metric.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={`metric-${metric.id}`}
              type="number"
              step="1"
              placeholder={metricDef.label}
              value={currentValue}
              onChange={(e) => handleValueChange(metric.id, e.target.value)}
              required={metric.is_required}
              inputMode="numeric"
            />
          </div>
        );

      case 'text':
        return (
          <div key={metric.id} className="space-y-1">
            <Label htmlFor={`metric-${metric.id}`} className="text-xs">
              {label}
              {metric.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={`metric-${metric.id}`}
              type="text"
              placeholder={metricDef.label}
              value={currentValue}
              onChange={(e) => handleValueChange(metric.id, e.target.value)}
              required={metric.is_required}
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={metric.id} className="flex items-center space-x-2">
            <Checkbox
              id={`metric-${metric.id}`}
              checked={Boolean(currentValue)}
              onCheckedChange={(checked) => handleValueChange(metric.id, checked)}
            />
            <Label htmlFor={`metric-${metric.id}`} className="text-xs">
              {metricDef.label}
              {metric.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
          </div>
        );

      case 'enum':
        return (
          <div key={metric.id} className="space-y-1">
            <Label htmlFor={`metric-${metric.id}`} className="text-xs">
              {label}
              {metric.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={currentValue}
              onValueChange={(value) => handleValueChange(metric.id, value)}
              required={metric.is_required}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${metricDef.label}`} />
              </SelectTrigger>
              <SelectContent>
                {metricDef.enum_options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {isMobile ? (
        <Tabs value={useEnhanced ? "enhanced" : "standard"} onValueChange={(value) => setUseEnhanced(value === "enhanced")}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">Additional Metrics</h4>
            <TabsList className="h-8">
              <TabsTrigger value="standard" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Standard
              </TabsTrigger>
              <TabsTrigger value="enhanced" className="text-xs">
                <Smartphone className="h-3 w-3 mr-1" />
                Enhanced
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="standard">
            <div className="grid grid-cols-2 gap-2">
              {metrics.map(renderMetricInput)}
            </div>
          </TabsContent>
          
          <TabsContent value="enhanced">
            <EnhancedMetricsForm
              metrics={metrics}
              values={values}
              onValuesChange={onValuesChange}
              exerciseHistory={mockExerciseHistory}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <h4 className="text-sm font-medium text-muted-foreground">Additional Metrics</h4>
          <div className="grid grid-cols-2 gap-2">
            {metrics.map(renderMetricInput)}
          </div>
        </>
      )}
    </div>
  );
};

export default DynamicMetricsForm;