import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BodyPart {
  id: string;
  name: string;
  slug?: string;
}

interface MuscleGroup {
  id: string;
  name: string;
  body_part_id: string;
  slug?: string;
}

interface Muscle {
  id: string;
  name: string;
  muscle_group_id: string;
  slug?: string;
}

export default function FitnessConfigure() {
  // Data
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [muscles, setMuscles] = useState<Muscle[]>([]);

  // Form states
  const [bpName, setBpName] = useState("");
  const [mgBodyPartId, setMgBodyPartId] = useState("");
  const [mgName, setMgName] = useState("");
  const [mBodyPartId, setMBodyPartId] = useState("");
  const [mGroupId, setMGroupId] = useState("");
  const [mName, setMName] = useState("");

  const loadAll = async () => {
    try {
      const [bp, mg, m] = await Promise.all([
        supabase.from('v_body_parts_with_translations').select('id, slug, translations'),
        supabase.from('v_muscle_groups_with_translations').select('id, slug, body_part_id, translations'),
        supabase.from('v_muscles_with_translations').select('id, slug, muscle_group_id, translations'),
      ]);
      if (bp.error) throw bp.error;
      if (mg.error) throw mg.error;
      if (m.error) throw m.error;
      
      setBodyParts(bp.data?.map(item => ({ 
        id: item.id, 
        slug: item.slug, 
        name: (item.translations as any)?.en?.name || (item.translations as any)?.['en-US']?.name || 'Unnamed' 
      })) || []);
      
      setMuscleGroups(mg.data?.map(item => ({ 
        id: item.id, 
        slug: item.slug, 
        body_part_id: item.body_part_id, 
        name: (item.translations as any)?.en?.name || (item.translations as any)?.['en-US']?.name || 'Unnamed' 
      })) || []);
      
      setMuscles(m.data?.map(item => ({ 
        id: item.id, 
        slug: item.slug, 
        muscle_group_id: item.muscle_group_id, 
        name: (item.translations as any)?.en?.name || (item.translations as any)?.['en-US']?.name || 'Unnamed' 
      })) || []);
    } catch (error: any) {
      toast({ title: 'Failed to load data', description: error.message });
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Dependent dropdowns in Muscles create form
  const groupsForSelectedBP = React.useMemo(() => muscleGroups.filter(g => g.body_part_id === mBodyPartId), [muscleGroups, mBodyPartId]);

  // CRUD handlers
  const addBodyPart = async () => {
    if (!bpName.trim()) return;
    
    try {
      // Create body part
      const { data: bodyPart, error: bodyPartError } = await supabase
        .from('body_parts')
        .insert([{ slug: bpName.toLowerCase().replace(/\s+/g, '-') }])
        .select()
        .single();
      if (bodyPartError) throw bodyPartError;

      // Create English translation
      const { error: translationError } = await supabase
        .from('body_parts_translations')
        .insert([{
          body_part_id: bodyPart.id,
          language_code: 'en',
          name: bpName.trim()
        }]);
      if (translationError) throw translationError;

      setBpName("");
      await loadAll();
      toast({ title: 'Body part added' });
    } catch (error: any) {
      toast({ title: 'Failed to add body part', description: error.message });
    }
  };

  const renameBodyPart = async (bp: any) => {
    const name = prompt('Rename body part', bp.name);
    if (!name) return;
    
    try {
      const { error } = await supabase
        .from('body_parts_translations')
        .update({ name })
        .eq('body_part_id', bp.id)
        .eq('language_code', 'en');
      if (error) throw error;
      
      await loadAll();
      toast({ title: 'Updated' });
    } catch (error: any) {
      toast({ title: 'Failed to update', description: error.message });
    }
  };

  const deleteBodyPart = async (bp: any) => {
    if (!confirm(`Delete ${bp.name} and all its groups/muscles?`)) return;
    const { error } = await supabase.from('body_parts').delete().eq('id', bp.id);
    if (error) { toast({ title: 'Failed to delete', description: error.message }); return; }
    await loadAll();
    toast({ title: 'Deleted' });
  };

  const addMuscleGroup = async () => {
    if (!mgBodyPartId || !mgName.trim()) return;
    
    try {
      // Create muscle group
      const { data: muscleGroup, error: muscleGroupError } = await supabase
        .from('muscle_groups')
        .insert([{ 
          body_part_id: mgBodyPartId, 
          slug: mgName.toLowerCase().replace(/\s+/g, '-') 
        }])
        .select()
        .single();
      if (muscleGroupError) throw muscleGroupError;

      // Create English translation
      const { error: translationError } = await supabase
        .from('muscle_groups_translations')
        .insert([{
          muscle_group_id: muscleGroup.id,
          language_code: 'en',
          name: mgName.trim()
        }]);
      if (translationError) throw translationError;

      setMgName("");
      await loadAll();
      toast({ title: 'Muscle group added' });
    } catch (error: any) {
      toast({ title: 'Failed to add group', description: error.message });
    }
  };

  const renameMuscleGroup = async (mg: any) => {
    const name = prompt('Rename muscle group', mg.name);
    if (!name) return;
    
    try {
      const { error } = await supabase
        .from('muscle_groups_translations')
        .update({ name })
        .eq('muscle_group_id', mg.id)
        .eq('language_code', 'en');
      if (error) throw error;
      
      await loadAll();
      toast({ title: 'Updated' });
    } catch (error: any) {
      toast({ title: 'Failed to update', description: error.message });
    }
  };

  const deleteMuscleGroup = async (mg: any) => {
    if (!confirm(`Delete ${mg.name} and its muscles?`)) return;
    const { error } = await supabase.from('muscle_groups').delete().eq('id', mg.id);
    if (error) { toast({ title: 'Failed to delete', description: error.message }); return; }
    await loadAll();
    toast({ title: 'Deleted' });
  };

  const addMuscle = async () => {
    if (!mGroupId || !mName.trim()) return;
    
    try {
      // Create muscle
      const { data: muscle, error: muscleError } = await supabase
        .from('muscles')
        .insert([{ 
          muscle_group_id: mGroupId, 
          slug: mName.toLowerCase().replace(/\s+/g, '-') 
        }])
        .select()
        .single();
      if (muscleError) throw muscleError;

      // Create English translation
      const { error: translationError } = await supabase
        .from('muscles_translations')
        .insert([{
          muscle_id: muscle.id,
          language_code: 'en',
          name: mName.trim()
        }]);
      if (translationError) throw translationError;

      setMName("");
      await loadAll();
      toast({ title: 'Muscle added' });
    } catch (error: any) {
      toast({ title: 'Failed to add muscle', description: error.message });
    }
  };

  const renameMuscle = async (m: any) => {
    const name = prompt('Rename muscle', m.name);
    if (!name) return;
    
    try {
      const { error } = await supabase
        .from('muscles_translations')
        .update({ name })
        .eq('muscle_id', m.id)
        .eq('language_code', 'en');
      if (error) throw error;
      
      await loadAll();
      toast({ title: 'Updated' });
    } catch (error: any) {
      toast({ title: 'Failed to update', description: error.message });
    }
  };

  const deleteMuscle = async (m: any) => {
    if (!confirm(`Delete ${m.name}?`)) return;
    const { error } = await supabase.from('muscles').delete().eq('id', m.id);
    if (error) { toast({ title: 'Failed to delete', description: error.message }); return; }
    await loadAll();
    toast({ title: 'Deleted' });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Fitness Configuration</h1>

      {/* Body Parts */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Body Parts</h2>
        <div className="flex gap-2 mb-4">
          <Input value={bpName} onChange={(e) => setBpName(e.target.value)} placeholder="Body part name" />
          <Button onClick={addBodyPart}>Add</Button>
        </div>
        <div className="space-y-2">
          {bodyParts.map(bp => (
            <div key={bp.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{bp.name}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => renameBodyPart(bp)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteBodyPart(bp)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Muscle Groups */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Muscle Groups</h2>
        <div className="flex gap-2 mb-4">
          <Select value={mgBodyPartId} onValueChange={setMgBodyPartId}>
            <SelectTrigger>
              <SelectValue placeholder="Select body part" />
            </SelectTrigger>
            <SelectContent>
              {bodyParts.map(bp => (
                <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={mgName} onChange={(e) => setMgName(e.target.value)} placeholder="Group name" />
          <Button onClick={addMuscleGroup}>Add</Button>
        </div>
        <div className="space-y-2">
          {muscleGroups.map(mg => (
            <div key={mg.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{mg.name} <em>({bodyParts.find(bp => bp.id === mg.body_part_id)?.name})</em></span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => renameMuscleGroup(mg)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteMuscleGroup(mg)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Muscles */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Muscles</h2>
        <div className="flex gap-2 mb-4">
          <Select value={mBodyPartId} onValueChange={setMBodyPartId}>
            <SelectTrigger>
              <SelectValue placeholder="Select body part" />
            </SelectTrigger>
            <SelectContent>
              {bodyParts.map(bp => (
                <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={mGroupId} onValueChange={setMGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="Select muscle group" />
            </SelectTrigger>
            <SelectContent>
              {groupsForSelectedBP.map(mg => (
                <SelectItem key={mg.id} value={mg.id}>{mg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={mName} onChange={(e) => setMName(e.target.value)} placeholder="Muscle name" />
          <Button onClick={addMuscle}>Add</Button>
        </div>
        <div className="space-y-2">
          {muscles.map(m => (
            <div key={m.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{m.name} <em>({muscleGroups.find(mg => mg.id === m.muscle_group_id)?.name})</em></span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => renameMuscle(m)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteMuscle(m)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}