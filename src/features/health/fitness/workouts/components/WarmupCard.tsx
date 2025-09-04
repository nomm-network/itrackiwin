import React from "react";

interface WarmupCardProps {
  warmup: any;
  topWeight: number | null;
}

const WarmupCard: React.FC<WarmupCardProps> = ({ warmup, topWeight }) => {
  if (!warmup || !Array.isArray(warmup)) return null;

  return (
    <div className="bg-gray-900 rounded-lg p-4 space-y-2 border border-gray-700">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        Warm-up 🏋️‍♂️
      </h3>
      <p className="text-sm text-gray-400">
        Strategy: ramped • Top: {topWeight ? `${topWeight}kg` : "—"} •{" "}
        <a href="#" className="text-blue-400 hover:underline">
          Auto-adjusts from feedback
        </a>
      </p>

      <div className="space-y-1">
        {warmup.map((step: any, idx: number) => (
          <div
            key={idx}
            className="flex justify-between text-sm text-gray-200"
          >
            <span>
              – {step.kg}kg × {step.reps} reps
            </span>
            <span className="text-gray-400">{step.rest_s}s rest</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button className="flex-1 bg-gray-800 py-1 rounded text-xs">
          🥶 Too little
        </button>
        <button className="flex-1 bg-gray-800 py-1 rounded text-xs">
          🔥 Excellent
        </button>
        <button className="flex-1 bg-gray-800 py-1 rounded text-xs">
          🥵 Too much
        </button>
      </div>
    </div>
  );
};

export default WarmupCard;