import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function SleepBody() {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-4">Sleep Quality</h2>
        <p className="text-muted-foreground">Sleep tracking features coming soon!</p>
      </CardContent>
    </Card>
  );
}