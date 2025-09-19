import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Scale, Ruler, Edit3 } from "lucide-react";

interface BodyMetricsDisplayProps {
  showEditButton?: boolean;
}

export const BodyMetricsDisplay: React.FC<BodyMetricsDisplayProps> = ({ 
  showEditButton = true 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    weight_kg: '',
    height_cm: '',
    notes: ''
  });

  // Fetch latest metrics
  const { data: latestMetrics, isLoading } = useQuery({
    queryKey: ['latest-body-metrics'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) return null;

      const { data, error } = await supabase
        .from('user_body_metrics')
        .select('*')
        .eq('user_id', user.user.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const recordMetrics = useMutation({
    mutationFn: async (metrics: { weight_kg?: number; height_cm?: number; notes?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_body_metrics')
        .insert({
          user_id: user.user.id,
          weight_kg: metrics.weight_kg,
          height_cm: metrics.height_cm,
          notes: metrics.notes,
          source: 'manual',
          recorded_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Metrics updated",
        description: "Your body metrics have been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['latest-body-metrics'] });
      setIsDialogOpen(false);
      setFormData({ weight_kg: '', height_cm: '', notes: '' });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to record metrics: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const weight = formData.weight_kg ? Number(formData.weight_kg) : undefined;
    const height = formData.height_cm ? Number(formData.height_cm) : undefined;
    
    if (!weight && !height) {
      toast({
        title: "No data to record",
        description: "Please enter at least weight or height.",
        variant: "destructive",
      });
      return;
    }

    recordMetrics.mutate({
      weight_kg: weight,
      height_cm: height,
      notes: formData.notes || undefined
    });
  };

  const openDialog = () => {
    // Pre-fill with current values
    setFormData({
      weight_kg: latestMetrics?.weight_kg?.toString() || '',
      height_cm: latestMetrics?.height_cm?.toString() || '',
      notes: ''
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        Loading metrics...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        {latestMetrics?.weight_kg && (
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{latestMetrics.weight_kg}kg</span>
          </div>
        )}
        
        {latestMetrics?.height_cm && (
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{latestMetrics.height_cm}cm</span>
          </div>
        )}

        {!latestMetrics?.weight_kg && !latestMetrics?.height_cm && (
          <span className="text-sm text-muted-foreground">No metrics recorded</span>
        )}
      </div>

      {showEditButton && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={openDialog}>
              <Edit3 className="h-4 w-4 mr-2" />
              Update
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Body Metrics</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="70.5"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      weight_kg: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={formData.height_cm}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      height_cm: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={recordMetrics.isPending}
                  className="flex-1"
                >
                  {recordMetrics.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};