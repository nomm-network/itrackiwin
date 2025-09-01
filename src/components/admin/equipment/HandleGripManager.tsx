import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface HandleGripManagerProps {
  equipmentId: string;
  handleId: string;
  handleName: string;
  onClose: () => void;
  onSave: (grips: { gripId: string; isAllowed: boolean; isDefault: boolean }[]) => void;
}

interface HandleGrip {
  id: string;
  grip_id: string;
  is_default: boolean;
  grip: {
    id: string;
    slug: string;
    category: string;
    translations: { language_code: string; name: string }[];
  };
}

interface AvailableGrip {
  id: string;
  slug: string;
  category: string;
  translations: { language_code: string; name: string }[];
}

export function HandleGripManager({ equipmentId, handleId, handleName, onClose, onSave }: HandleGripManagerProps) {
  const [gripStates, setGripStates] = useState<{ gripId: string; isAllowed: boolean; isDefault: boolean }[]>([]);

  // Fetch all available grips
  const { data: allGrips = [], isLoading: allGripsLoading } = useQuery({
    queryKey: ['all-grips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grips')
        .select(`
          id, slug, category,
          translations:grips_translations (language_code, name)
        `)
        .order('category, slug');
      
      if (error) throw error;
      return data as any;
    }
  });

  // Fetch existing grips for this handle
  const { data: handleGrips = [], isLoading: gripsLoading } = useQuery({
    queryKey: ['equipment-handle-grips', equipmentId, handleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_handle_grips')
        .select(`
          id,
          grip_id,
          is_default,
          grip:grips (
            id, slug, category,
            translations:grips_translations (language_code, name)
          )
        `)
        .eq('equipment_id', equipmentId)
        .eq('handle_id', handleId);
      
      if (error) throw error;
      return data as any;
    }
  });

  // Initialize grip states when data loads
  useEffect(() => {
    if (allGrips.length > 0) {
      const initialStates = allGrips.map((grip: any) => {
        const handleGrip = handleGrips.find((hg: any) => hg.grip_id === grip.id);
        return {
          gripId: grip.id,
          isAllowed: !!handleGrip,
          isDefault: handleGrip?.is_default || false
        };
      });
      setGripStates(initialStates);
    }
  }, [allGrips, handleGrips]);

  const getGripName = (grip: any) => {
    return grip?.translations?.find((t: any) => t.language_code === 'en')?.name || 
           grip?.slug?.replace(/-/g, ' ') || 
           'Unknown Grip';
  };

  const updateGripState = (gripId: string, field: 'isAllowed' | 'isDefault', value: boolean) => {
    setGripStates(prev => prev.map(grip => {
      if (grip.gripId === gripId) {
        if (field === 'isAllowed' && !value) {
          // If unchecking allowed, also uncheck default
          return { ...grip, isAllowed: false, isDefault: false };
        } else if (field === 'isDefault' && value) {
          // If setting as default, uncheck all other defaults
          const updated = prev.map(g => ({ ...g, isDefault: g.gripId === gripId }));
          return updated.find(g => g.gripId === gripId)!;
        }
        return { ...grip, [field]: value };
      } else if (field === 'isDefault' && value) {
        // Uncheck default for other grips
        return { ...grip, isDefault: false };
      }
      return grip;
    }));
  };

  const handleSave = () => {
    onSave(gripStates);
  };

  if (gripsLoading || allGripsLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Grip Configuration: {handleName}</h4>
        <Button onClick={onClose} variant="ghost" size="sm">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {allGrips.map((grip: any) => {
          const gripState = gripStates.find(gs => gs.gripId === grip.id);
          const isAllowed = gripState?.isAllowed || false;
          const isDefault = gripState?.isDefault || false;
          
          return (
            <div key={grip.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="font-medium">{getGripName(grip)}</div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isAllowed}
                    onCheckedChange={(checked) => 
                      updateGripState(grip.id, 'isAllowed', checked as boolean)
                    }
                  />
                  <label className="text-sm">Allowed</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isDefault}
                    disabled={!isAllowed}
                    onCheckedChange={(checked) => 
                      updateGripState(grip.id, 'isDefault', checked as boolean)
                    }
                  />
                  <label className="text-sm">Default</label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={onClose} variant="outline">Cancel</Button>
        <Button onClick={handleSave}>Save Grips</Button>
      </div>
    </div>
  );
}