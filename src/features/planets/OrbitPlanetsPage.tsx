import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function OrbitPlanetsPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold mb-4">Discover by Planets</h1>
          <p className="text-muted-foreground">
            Explore different areas of your life represented as planets in your personal orbit.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}