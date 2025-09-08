import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function EnergyBody() {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-4">Energy Levels</h2>
        <p className="text-muted-foreground">Energy tracking features coming soon!</p>
      </CardContent>
    </Card>
  );
}