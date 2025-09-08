import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function MedicalBody() {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-4">Medical Checkups</h2>
        <p className="text-muted-foreground">Medical tracking features coming soon!</p>
      </CardContent>
    </Card>
  );
}