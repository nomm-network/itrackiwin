import React from 'react';
import { useParams } from 'react-router-dom';
import WorkoutTracker from '../components/WorkoutTracker';

const WorkoutPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();

  // DEBUG PANEL - ALWAYS VISIBLE
  const DebugPanel = () => (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg max-w-md w-full z-50 text-xs font-mono">
      <div className="text-yellow-400 font-bold mb-2">🐛 DEBUG PANEL - WorkoutPage.tsx</div>
      <div className="space-y-1">
        <div><span className="text-green-400">WorkoutId from URL:</span> {workoutId || 'NO WORKOUT ID'}</div>
        <div><span className="text-green-400">Current URL:</span> {window.location.href}</div>
        <div><span className="text-green-400">All URL Params:</span> {JSON.stringify(useParams())}</div>
        <div><span className="text-green-400">Component:</span> WorkoutPage.tsx</div>
      </div>
    </div>
  );

  return (
    <div>
      <DebugPanel />
      <WorkoutTracker workoutId={workoutId!} />
    </div>
  );
};

export default WorkoutPage;