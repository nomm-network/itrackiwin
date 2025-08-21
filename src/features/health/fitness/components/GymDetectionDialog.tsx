import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Clock, Plus } from 'lucide-react';
import { useGymDetection, useSetDefaultGym, useAddManualGym } from '../hooks/useGymDetection.hook';
import { useToast } from '@/hooks/use-toast';

interface GymCandidate {
  gym_id: string;
  name: string;
  distance_m: number;
  address: string;
  confidence: number;
}

interface GymDetectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGymSelected?: (gymId: string) => void;
}

export const GymDetectionDialog: React.FC<GymDetectionDialogProps> = ({
  open,
  onOpenChange,
  onGymSelected,
}) => {
  const [candidates, setCandidates] = useState<GymCandidate[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualGymName, setManualGymName] = useState('');
  const [manualGymAddress, setManualGymAddress] = useState('');
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

  const { detectGym } = useGymDetection();
  const setDefaultGym = useSetDefaultGym();
  const addManualGym = useAddManualGym();
  const { toast } = useToast();

  const handleDetectGyms = async () => {
    try {
      setIsDetecting(true);
      setHasRequestedLocation(true);
      
      const result = await detectGym({});
      setCandidates(result.candidates);
      
      if (result.candidates.length === 0) {
        toast({
          title: "No gyms found",
          description: "We couldn't find any gyms near your location. You can add one manually.",
        });
      }
    } catch (error) {
      console.error('Error detecting gyms:', error);
      toast({
        title: "Location access denied",
        description: "Please allow location access to find nearby gyms, or add one manually.",
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSelectGym = async (gymId: string) => {
    try {
      await setDefaultGym.mutateAsync(gymId);
      
      toast({
        title: "Gym selected",
        description: "Your default gym has been set successfully!",
      });
      
      onGymSelected?.(gymId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error setting default gym:', error);
      toast({
        title: "Error",
        description: "Failed to set default gym. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddManualGym = async () => {
    if (!manualGymName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a gym name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await addManualGym.mutateAsync({
        name: manualGymName.trim(),
        address: manualGymAddress.trim() || undefined,
      });

      toast({
        title: "Gym added",
        description: "Your gym has been added and set as default!",
      });

      onGymSelected?.(result.gym.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding manual gym:', error);
      toast({
        title: "Error",
        description: "Failed to add gym. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find Your Gym
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!hasRequestedLocation && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Allow location access to automatically find nearby gyms and load your equipment presets.
              </p>
              
              <Button onClick={handleDetectGyms} disabled={isDetecting} className="w-full">
                {isDetecting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Finding gyms...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Allow Location & Find Gyms
                  </>
                )}
              </Button>
            </div>
          )}

          {hasRequestedLocation && candidates.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Select your gym:</h4>
              
              {candidates.map((gym) => (
                <div
                  key={gym.gym_id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => handleSelectGym(gym.gym_id)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{gym.name}</div>
                    {gym.address && (
                      <div className="text-sm text-muted-foreground">{gym.address}</div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{formatDistance(gym.distance_m)}</span>
                      <span className={getConfidenceColor(gym.confidence)}>
                        {(gym.confidence * 100).toFixed(0)}% match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4">
            {!showManualForm ? (
              <Button
                variant="outline"
                onClick={() => setShowManualForm(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add gym manually
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="gymName">Gym name *</Label>
                  <Input
                    id="gymName"
                    value={manualGymName}
                    onChange={(e) => setManualGymName(e.target.value)}
                    placeholder="Enter gym name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gymAddress">Address (optional)</Label>
                  <Input
                    id="gymAddress"
                    value={manualGymAddress}
                    onChange={(e) => setManualGymAddress(e.target.value)}
                    placeholder="Enter gym address"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowManualForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddManualGym}
                    disabled={addManualGym.isPending}
                    className="flex-1"
                  >
                    {addManualGym.isPending ? 'Adding...' : 'Add Gym'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};