import React from "react";

interface WorkoutSetCardProps {
  set: any;
  onUpdate?: (data: any) => void;
  setIndex?: number;
  prev?: { weight: number; reps: number; date: string };
  target?: { weight: number; reps: number };
}

const WorkoutSetCard: React.FC<WorkoutSetCardProps> = ({
  set,
  onUpdate,
  setIndex,
  prev,
  target,
}) => {
  const actualSetIndex = setIndex || set?.set_index || 1;
  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-3 border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">Set {actualSetIndex}</h4>
        <span className="text-xs text-gray-400">Current Set</span>
      </div>

      {/* Previous + Target */}
      <div className="space-y-1 mb-3 text-sm">
        {prev ? (
          <div className="text-gray-300">
            📜 Prev {prev.weight}kg × {prev.reps}{" "}
            <span className="text-xs text-gray-400 ml-2">{prev.date}</span>
          </div>
        ) : (
          <div className="text-gray-500">No previous data</div>
        )}

        {target ? (
          <div className="text-red-400">
            🎯 Target {target.weight}kg × {target.reps}
          </div>
        ) : (
          <div className="text-gray-500">No target set</div>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-400">Weight (kg)</label>
          <input
            type="number"
            className="w-full bg-gray-800 rounded px-2 py-1 text-white"
            defaultValue={target?.weight || set?.target_weight_kg || set?.weight_kg || ""}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400">Reps</label>
          <input
            type="number"
            className="w-full bg-gray-800 rounded px-2 py-1 text-white"
            defaultValue={target?.reps || set?.target_reps || set?.reps || ""}
          />
        </div>
      </div>

      {/* Feedback */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-400">How did that feel?</span>
        <div className="flex gap-2 text-lg">
          <button>😖</button>
          <button>😣</button>
          <button>🙂</button>
          <button>😏</button>
          <button>😎</button>
        </div>
      </div>

      {/* Pain checkbox */}
      <div className="mb-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="form-checkbox" />
          No pain 💢
        </label>
      </div>

      {/* Log button */}
      <button className="w-full bg-green-600 py-2 rounded text-sm font-semibold">
        Log Set {actualSetIndex}
      </button>
    </div>
  );
};

export default WorkoutSetCard;