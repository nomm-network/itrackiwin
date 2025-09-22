import React from 'react';

const WorkoutDebugBox: React.FC = () => {
  return (
    <div className="bg-red-600 text-white p-3 mb-4 rounded-lg font-mono text-sm">
      <div className="font-bold">🐛 DEBUG BOX v107</div>
      <div>Status: Active</div>
      <div>Forms: BodyweightSetForm added</div>
      <div>SmartSetForm routing: effort_mode + load_mode</div>
    </div>
  );
};

export default WorkoutDebugBox;