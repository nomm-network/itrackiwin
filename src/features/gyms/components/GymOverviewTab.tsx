import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Calendar, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Gym } from '@/hooks/useGyms';

interface GymOverviewTabProps {
  gym: Gym;
  isAdmin: boolean | null;
}

export default function GymOverviewTab({ gym, isAdmin }: GymOverviewTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const generateQRUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/gyms/${gym.id}/join`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-base">{gym.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant="outline" className={getStatusColor(gym.status)}>
                  {gym.status}
                </Badge>
              </div>
            </div>

            {gym.city && gym.country && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{gym.city}, {gym.country}</span>
                </div>
              </div>
            )}

            {gym.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="text-base mt-1">{gym.address}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(gym.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code & Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Gym QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this QR code to allow coaches to request membership to your gym.
            </p>
            
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="w-32 h-32 mx-auto bg-white border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center">
                <QrCode className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">QR Code placeholder</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Share URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={generateQRUrl()} 
                  readOnly
                  className="flex-1 px-3 py-2 text-xs border rounded bg-muted"
                />
                <Button size="sm" onClick={() => navigator.clipboard.writeText(generateQRUrl())}>
                  Copy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Checklist for Admins */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
                <span className="text-sm">Gym created successfully</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">Add gym admins</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">Accept coach requests</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">Configure equipment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">Print poster/QR code</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}