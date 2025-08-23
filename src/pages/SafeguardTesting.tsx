import React from 'react';
import { SafeguardTestingPanel } from '@/components/fitness/SafeguardTestingPanel';

const SafeguardTesting: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Safeguards & Rate Limits Testing</h1>
          <p className="text-muted-foreground mt-2">
            Verify that idempotency keys and rate limiting prevent runaway jobs and abuse.
          </p>
        </div>
        
        <SafeguardTestingPanel />
      </div>
    </div>
  );
};

export default SafeguardTesting;