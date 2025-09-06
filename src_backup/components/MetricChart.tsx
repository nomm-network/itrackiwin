import React from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from "recharts";

interface Point { x: string; y: number }

interface MetricChartProps {
  data: Point[];
  colorHsl?: string; // e.g. "217 91% 66%"
}

const MetricChart: React.FC<MetricChartProps> = ({ data, colorHsl = "217 91% 66%" }) => {
  return (
    <div className="w-full h-48">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
          <XAxis dataKey="x" hide />
          <YAxis hide domain={[0, 'dataMax + 2']} />
          <ReTooltip />
          <Line type="monotone" dataKey="y" stroke={`hsl(${colorHsl})`} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricChart;
