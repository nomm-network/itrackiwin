import React, { useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { ArrowLeft, Trash2, Edit2, Settings } from "lucide-react";
import { useTemplateExercises, useAddExerciseToTemplate, useDeleteTemplateExercise, useTemplateDetail, useUpdateTemplate, useTemplateExercisePreferences, useUpsertTemplateExercisePreferences } from "@/features/health/fitness/services/fitness.api";
import GripSelector from "@/components/GripSelector";
import { useTranslations } from "@/hooks/useTranslations";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import PageNav from "@/components/PageNav";

interface BodyPart {
  id: string;
  translations: any;
}

interface MuscleGroup {
  id: string;
  body_part_id: string;
  translations: any;
}

interface Muscle {
  id: string;
  muscle_group_id: string;
  translations: any;
}

interface Exercise {
  id: string;
  name: string;
  translations?: any;
  primary_muscle_id?: string;
  body_part_id?: string;
}

interface ExerciseGripEditor {
  exerciseId: string;
  selectedGrips: string[];
}

const TemplateEditor: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { getTranslatedName } = useTranslations();
  
  // Template data and mutations
  const { data: template } = useTemplateDetail(templateId);
  const { data: templateExercises = [] } = useTemplateExercises(templateId);
  const addToTemplate = useAddExerciseToTemplate();
  const deleteFromTemplate = useDeleteTemplateExercise();
  const updateTemplate = useUpdateTemplate();

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [gripEditors, setGripEditors] = useState<Record<string, ExerciseGripEditor>>({});
  
  // Grips mutation
  const upsertPreferences = useUpsertTemplateExercisePreferences();

  // Filter states
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Data queries
  const { data: bodyParts = [] } = useQuery<BodyPart[]>({
    queryKey: ["body_parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_body_parts_with_translations')
        .select('id, translations')
        .order('id');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: muscleGroups = [] } = useQuery<MuscleGroup[]>({
    queryKey: ["muscle_groups", selectedBodyPart],
    queryFn: async () => {
      let query = supabase
        .from('v_muscle_groups_with_translations')
        .select('id, body_part_id, translations')
        .order('id');
      
      if (selectedBodyPart) {
        query = query.eq('body_part_id', selectedBodyPart);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: muscles = [] } = useQuery<Muscle[]>({
    queryKey: ["muscles", selectedMuscleGroup],
    queryFn: async () => {
      let query = supabase
        .from('v_muscles_with_translations')
        .select('id, muscle_group_id, translations')
        .order('id');
      
      if (selectedMuscleGroup) {
        query = query.eq('muscle_group_id', selectedMuscleGroup);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ["exercises_for_template", searchQuery, selectedMuscle, selectedBodyPart],
    queryFn: async () => {
      if (searchQuery.length < 2 && !selectedMuscle && !selectedBodyPart) {
        return [];
      }

      let query = supabase
        .from('v_exercises_with_translations')
        .select('id, name, translations, primary_muscle_id, body_part_id')
        .eq('is_public', true)
        .order('popularity_rank', { ascending: false, nullsFirst: false })
        .limit(20);

      if (searchQuery.length >= 2) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (selectedMuscle) {
        query = query.eq('primary_muscle_id', selectedMuscle);
      } else if (selectedBodyPart) {
        query = query.eq('body_part_id', selectedBodyPart);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: searchQuery.length >= 2 || !!selectedMuscle || !!selectedBodyPart
  });

  // ... keep existing code for all the helper functions and queries ...

  if (!templateId) {
    return <div>Template not found</div>;
  }

  return (
    <>
      <PageNav current="Template Editor" />
      <nav className="container pt-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavLink to="/fitness" end className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Workouts
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/fitness/exercises" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Exercises
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/fitness/templates" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Templates
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/fitness/configure" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Configure
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      <main className="container py-4 md:py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/fitness/templates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-semibold">
              Template Editor
            </h1>
          </div>
        </div>

        <div className="text-center p-8 text-muted-foreground">
          <p>Template editor content will be implemented here.</p>
          <p>Please reference the original TemplateEditor.tsx file for the complete implementation.</p>
        </div>
      </main>
    </>
  );
};

export default TemplateEditor;