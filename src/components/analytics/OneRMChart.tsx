import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { TrendingUp, Award } from "lucide-react";

interface OneRMChartProps {
  timeframe: string;
  exerciseId?: string;
}

// Mock data - replace with real data from hooks
const mockOneRMData = [
  { date: "2024-01", benchPress: 100, squat: 140, deadlift: 160 },
  { date: "2024-02", benchPress: 102.5, squat: 142.5, deadlift: 165 },
  { date: "2024-03", benchPress: 105, squat: 145, deadlift: 167.5 },
  { date: "2024-04", benchPress: 107.5, squat: 147.5, deadlift: 170 },
  { date: "2024-05", benchPress: 110, squat: 150, deadlift: 175 },
  { date: "2024-06", benchPress: 112.5, squat: 152.5, deadlift: 177.5 },
];

const exercises = [
  { id: "bench-press", name: "Bench Press", color: "#8884d8" },
  { id: "squat", name: "Squat", color: "#82ca9d" },
  { id: "deadlift", name: "Deadlift", color: "#ffc658" },
];

export const OneRMChart = ({ timeframe, exerciseId }: OneRMChartProps) => {
  const [selectedExercises, setSelectedExercises] = useState(["benchPress", "squat", "deadlift"]);

  const formatTooltip = (value: number, name: string) => [
    `${value}kg`,
    name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              1RM Progression
            </CardTitle>
            <CardDescription>
              Track your estimated 1-rep max progress over time
            </CardDescription>
          </div>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select exercises" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exercises</SelectItem>
              <SelectItem value="bench-press">Bench Press</SelectItem>
              <SelectItem value="squat">Squat</SelectItem>
              <SelectItem value="deadlift">Deadlift</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockOneRMData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs text-muted-foreground"
              />
              <YAxis 
                className="text-xs text-muted-foreground"
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
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
              
              {selectedExercises.includes("benchPress") && (
                <Line
                  type="monotone"
                  dataKey="benchPress"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#8884d8" }}
                />
              )}
              
              {selectedExercises.includes("squat") && (
                <Line
                  type="monotone"
                  dataKey="squat"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ fill: "#82ca9d", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#82ca9d" }}
                />
              )}
              
              {selectedExercises.includes("deadlift") && (
                <Line
                  type="monotone"
                  dataKey="deadlift"
                  stroke="#ffc658"
                  strokeWidth={2}
                  dot={{ fill: "#ffc658", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#ffc658" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend and Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8884d8]" />
            <span>Bench Press</span>
            <span className="ml-auto font-semibold">112.5kg</span>
            <span className="text-green-600 text-xs">↗ +12.5%</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#82ca9d]" />
            <span>Squat</span>
            <span className="ml-auto font-semibold">152.5kg</span>
            <span className="text-green-600 text-xs">↗ +8.9%</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ffc658]" />
            <span>Deadlift</span>
            <span className="ml-auto font-semibold">177.5kg</span>
            <span className="text-green-600 text-xs">↗ +10.9%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};