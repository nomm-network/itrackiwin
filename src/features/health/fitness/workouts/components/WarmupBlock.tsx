import React from "react";

interface WarmupStep {
  weight: number;
  reps: number;
  rest_seconds: number;
}

interface WarmupBlockProps {
  topWeight: number;
  warmupSteps: WarmupStep[];
}

const WarmupBlock: React.FC<WarmupBlockProps> = ({ topWeight, warmupSteps }) => {
  return (
    <div className="p-3 rounded-lg bg-gray-900 text-sm">
      <h3 className="text-base font-semibold mb-1.5">Warm-up 🏋️</h3>

      <p className="text-xs text-gray-400 mb-2.5">
        Strategy: ramped • Top: {topWeight}kg •{" "}
        <a href="#" className="text-blue-500 hover:text-blue-400">
          Auto-adjusts from feedback
        </a>
      </p>

      <ul className="space-y-1">
        {warmupSteps.map((step, i) => (
          <li key={i} className="flex justify-between">
            <span>– {step.weight}kg × {step.reps} reps</span>
            <span className="text-gray-500 text-xs">{step.rest_seconds}s rest</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-around mt-2.5 gap-2">
        <button className="bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded text-xs transition-colors">
          🥶 Too little
        </button>
        <button className="bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded text-xs transition-colors">
          🔥 Excellent
        </button>
        <button className="bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded text-xs transition-colors">
          🥵 Too much
        </button>
      </div>
    </div>
  );
};

export default WarmupBlock;