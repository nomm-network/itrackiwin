import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Activity, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface VolumeChartProps {
  timeframe: string;
  exerciseId?: string;
}

// Mock data - replace with real data from hooks
const mockVolumeData = [
  { date: "Week 1", volume: 18.5, sets: 45, workouts: 3 },
  { date: "Week 2", volume: 21.2, sets: 52, workouts: 4 },
  { date: "Week 3", volume: 19.8, sets: 48, workouts: 3 },
  { date: "Week 4", volume: 23.4, sets: 58, workouts: 4 },
  { date: "Week 5", volume: 25.1, sets: 62, workouts: 4 },
  { date: "Week 6", volume: 22.7, sets: 55, workouts: 3 },
  { date: "Week 7", volume: 26.3, sets: 65, workouts: 4 },
  { date: "Week 8", volume: 24.8, sets: 61, workouts: 4 },
];

export const VolumeChart = ({ timeframe, exerciseId }: VolumeChartProps) => {
  const [viewMode, setViewMode] = useState<"volume" | "sets">("volume");

  const formatTooltip = (value: number, name: string) => {
    if (name === "volume") return [`${value}T`, "Total Volume"];
    if (name === "sets") return [`${value}`, "Total Sets"];
    if (name === "workouts") return [`${value}`, "Workouts"];
    return [value, name];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Volume Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Training Volume Analytics
              </CardTitle>
              <CardDescription>
                Track your weekly training volume and frequency
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === "volume" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("volume")}
              >
                Volume
              </Button>
              <Button
                variant={viewMode === "sets" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("sets")}
              >
                Sets
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === "volume" ? (
                <AreaChart data={mockVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs text-muted-foreground"
                  />
                  <YAxis 
                    className="text-xs text-muted-foreground"
                    label={{ value: 'Volume (T)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={formatTooltip}
                    labelClassName="text-foreground"
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <BarChart data={mockVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs text-muted-foreground"
                  />
                  <YAxis 
                    className="text-xs text-muted-foreground"
                    label={{ value: 'Sets', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={formatTooltip}
                    labelClassName="text-foreground"
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar
                    dataKey="sets"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {/* Volume Summary */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">195.8T</div>
              <div className="text-muted-foreground">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">446</div>
              <div className="text-muted-foreground">Total Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">29</div>
              <div className="text-muted-foreground">Workouts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Volume Breakdown</CardTitle>
          <CardDescription>By muscle group this month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Chest</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div className="w-3/4 h-2 bg-primary rounded-full" />
                </div>
                <span className="text-sm font-medium">6.2T</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Back</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div className="w-4/5 h-2 bg-primary rounded-full" />
                </div>
                <span className="text-sm font-medium">7.1T</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Legs</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div className="w-full h-2 bg-primary rounded-full" />
                </div>
                <span className="text-sm font-medium">8.8T</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Shoulders</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div className="w-1/2 h-2 bg-primary rounded-full" />
                </div>
                <span className="text-sm font-medium">2.7T</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              View Detailed Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};