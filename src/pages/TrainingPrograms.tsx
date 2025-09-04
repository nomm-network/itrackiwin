import React from 'react';
import PageNav from '@/components/PageNav';
// import { TrainingProgramManager } from '@/components/fitness/TrainingProgramManager'; // TODO: Migrate this component

const TrainingProgramsPage = () => {
  return (
    <>
      <PageNav current="Training Programs" />
      <main className="container py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Training Programs</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage circular workout programs that automatically cycle through your templates.
            </p>
          </div>
          
          <div className="p-4 bg-muted rounded-lg text-center">
            <p>TrainingProgramManager component - Migration in progress</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default TrainingProgramsPage;