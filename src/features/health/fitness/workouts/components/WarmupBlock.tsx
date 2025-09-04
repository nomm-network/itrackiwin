// src/features/health/fitness/workouts/components/WarmupBlock.tsx
import React from "react";

interface WarmupStep {
  percent: number;
  reps: number;
  rest_s: number;
  kg: number;
}

interface WarmupBlockProps {
  steps: WarmupStep[];
}

const WarmupBlock: React.FC<WarmupBlockProps> = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-gray-50 border rounded-md p-2 text-sm">
      <h3 className="font-medium text-gray-700 mb-1">Warmup</h3>
      <ul className="space-y-1">
        {steps.map((step, idx) => (
          <li key={idx} className="flex justify-between text-gray-600">
            <span>
              {Math.round(step.percent * 100)}% — {step.reps} reps
            </span>
            <span>
              {step.kg} kg · {step.rest_s}s rest
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WarmupBlock;