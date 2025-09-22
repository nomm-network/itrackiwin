import React from 'react';

const WorkoutDebugBox: React.FC = () => {
  return (
    <div className="bg-red-600 text-white p-3 mb-4 rounded-lg font-mono text-sm border-2 border-white">
      <div className="font-bold text-lg">🐛 DEBUG BOX v108 - FIXED IMPORT</div>
      <div>Status: ACTIVE AND VISIBLE</div>
      <div>BodyweightSetForm: Using correct import path</div>
      <div>SmartSetForm: Fixed duplicate files issue</div>
    </div>
  );
};

export default WorkoutDebugBox;