import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MetricData {
  date: string;
  value: number;
  target?: number;
}

interface MetricVisualizationProps {
  title: string;
  data: MetricData[];
  unit?: string;
  target?: number;
  type?: 'line' | 'bar' | 'progress';
  className?: string;
}

const MetricVisualization: React.FC<MetricVisualizationProps> = ({
  title,
  data,
  unit = '',
  target,
  type = 'line',
  className
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    );
  }

  const latestValue = data[data.length - 1]?.value || 0;
  const previousValue = data.length > 1 ? data[data.length - 2]?.value : latestValue;
  const trend = latestValue > previousValue ? 'up' : latestValue < previousValue ? 'down' : 'stable';
  const trendPercentage = previousValue !== 0 ? ((latestValue - previousValue) / previousValue * 100).toFixed(1) : '0';

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderChart = () => {
    if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
            />
            <YAxis hide />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            {target && (
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
            />
            <YAxis hide />
            <Bar
              dataKey="value"
              fill="hsl(var(--primary))"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'progress' && target) {
      const progressPercentage = (latestValue / target) * 100;
      return (
        <div className="space-y-3">
          <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
          <div className="flex justify-between text-sm">
            <span>{latestValue} {unit}</span>
            <span className="text-muted-foreground">{target} {unit}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {target && (
            <Badge variant="outline" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Target
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Value */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {latestValue.toLocaleString()} {unit}
            </div>
            {data.length > 1 && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{Math.abs(parseFloat(trendPercentage))}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        {renderChart()}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium">{Math.min(...data.map(d => d.value))}</div>
            <div className="text-muted-foreground">Min</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{Math.max(...data.map(d => d.value))}</div>
            <div className="text-muted-foreground">Max</div>
          </div>
          <div className="text-center">
            <div className="font-medium">
              {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}
            </div>
            <div className="text-muted-foreground">Avg</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricVisualization;