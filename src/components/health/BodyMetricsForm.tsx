import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Scale, Ruler } from "lucide-react";

interface BodyMetrics {
  weight_kg?: number;
  height_cm?: number;
  notes?: string;
}

interface HistoricalMetric {
  id: string;
  recorded_at: string;
  weight_kg?: number;
  height_cm?: number;
  notes?: string;
}

export const BodyMetricsForm: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<BodyMetrics>({});

  // Fetch current/latest metrics
  const { data: latestMetrics } = useQuery({
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

  // Fetch recent history
  const { data: recentMetrics } = useQuery({
    queryKey: ['recent-body-metrics'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) return [];

      const { data, error } = await supabase
        .from('user_body_metrics')
        .select('*')
        .eq('user_id', user.user.id)
        .order('recorded_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as HistoricalMetric[];
    },
  });

  const recordMetrics = useMutation({
    mutationFn: async (metrics: BodyMetrics) => {
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
        title: "Metrics recorded",
        description: "Your body metrics have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['latest-body-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['recent-body-metrics'] });
      setFormData({});
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
    
    if (!formData.weight_kg && !formData.height_cm) {
      toast({
        title: "No data to record",
        description: "Please enter at least weight or height.",
        variant: "destructive",
      });
      return;
    }

    recordMetrics.mutate(formData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      {latestMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {latestMetrics.weight_kg && (
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{latestMetrics.weight_kg}kg</span>
                </div>
              )}
              {latestMetrics.height_cm && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{latestMetrics.height_cm}cm</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {formatDate(latestMetrics.recorded_at)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Record New Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Record New Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={formData.weight_kg || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    weight_kg: e.target.value ? Number(e.target.value) : undefined
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={formData.height_cm || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    height_cm: e.target.value ? Number(e.target.value) : undefined
                  }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about these measurements..."
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  notes: e.target.value || undefined
                }))}
                rows={2}
              />
            </div>

            <Button 
              type="submit" 
              disabled={recordMetrics.isPending}
              className="w-full"
            >
              {recordMetrics.isPending ? 'Recording...' : 'Record Metrics'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent History */}
      {recentMetrics && recentMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMetrics.map((metric) => (
                <div key={metric.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div className="flex gap-4">
                    {metric.weight_kg && (
                      <span className="text-sm font-medium">{metric.weight_kg}kg</span>
                    )}
                    {metric.height_cm && (
                      <span className="text-sm font-medium">{metric.height_cm}cm</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(metric.recorded_at)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};