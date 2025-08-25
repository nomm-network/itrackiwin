import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageNav from "@/components/PageNav";
import AdminMenu from "@/admin/components/AdminMenu";
import TranslationsMenu from "@/admin/components/TranslationsMenu";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Search } from "lucide-react";
import { getExerciseNameFromTranslations } from "@/utils/exerciseTranslations";

interface ExerciseTranslation {
  id: string;
  exercise_id: string;
  language_code: string;
  name: string;
  description?: string;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
}

interface Exercise {
  id: string;
  name: string;
  slug: string;
  body_part_slug: string;
  is_public: boolean;
}

const AdminExercisesTranslations: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingTranslation, setEditingTranslation] = useState<ExerciseTranslation | null>(null);
  const [newTranslation, setNewTranslation] = useState<Partial<ExerciseTranslation>>({});

  // Fetch languages
  const { data: languages = [] } = useQuery({
    queryKey: ["languages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("languages")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Language[];
    },
  });

  // Fetch exercises with search
  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("v_exercises_with_translations")
        .select("id, slug, body_part_slug, is_public, translations")
        .eq("is_public", true);
      
      const { data, error } = await query.limit(100);
      if (error) throw error;
      
      // Convert to Exercise format with extracted names
      const exercisesWithNames = data?.map(item => ({
        id: item.id,
        slug: item.slug,
        body_part_slug: item.body_part_slug,
        is_public: item.is_public,
        name: getExerciseNameFromTranslations(item.translations, item.id)
      })) || [];
      
      // Filter by search term if provided
      let filteredExercises = exercisesWithNames;
      if (searchTerm) {
        filteredExercises = exercisesWithNames.filter(ex => 
          ex.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return filteredExercises.slice(0, 20) as Exercise[];
    },
  });

  // Fetch translations for selected language and exercises
  const { data: translations = [], isLoading } = useQuery({
    queryKey: ["exercise_translations", selectedLanguage, searchTerm],
    queryFn: async () => {
      if (!selectedLanguage) return [];
      
      let query = supabase
        .from("exercises_translations")
        .select("*")
        .eq("language_code", selectedLanguage);
      
      if (searchTerm) {
        // Get exercise IDs that match the search
        const exerciseIds = exercises.map(e => e.id);
        if (exerciseIds.length > 0) {
          query = query.in("exercise_id", exerciseIds);
        }
      }
      
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as ExerciseTranslation[];
    },
    enabled: !!selectedLanguage,
  });

  // Create/Update mutation
  const upsertMutation = useMutation({
    mutationFn: async (translation: ExerciseTranslation) => {
      const { data, error } = await supabase
        .from("exercises_translations")
        .upsert(translation)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise_translations"] });
      setEditingTranslation(null);
      setNewTranslation({});
      toast({ title: t('labels.translation_saved') });
    },
    onError: (error) => {
      toast({ title: t('labels.error'), description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("exercises_translations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise_translations"] });
      toast({ title: t('labels.translation_deleted') });
    },
    onError: (error) => {
      toast({ title: t('labels.error'), description: error.message, variant: "destructive" });
    },
  });

  const handleSave = (translation: ExerciseTranslation) => {
    upsertMutation.mutate(translation);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    return exercise?.name || exerciseId;
  };

  return (
    <main className="container py-6">
      <PageNav current="Admin / Translations / Exercises" />
      <AdminMenu />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('pages.exercise_translations')}</h1>
        <TranslationsMenu />
        
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-2 items-center">
            <Label htmlFor="language-select">{t('labels.select_language')}</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('labels.select_language')} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.native_name} ({lang.code})
                  </SelectItem>
                ))}</SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 items-center">
            <Label htmlFor="search">{t('labels.search_exercises')}</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={t('labels.search_exercises')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>

        {selectedLanguage && (
          <div className="space-y-6">
            {/* Add new translation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {t('admin.add_new_translation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-exercise">{t('admin.exercise')}</Label>
                  <Select 
                    value={newTranslation.exercise_id || ""} 
                    onValueChange={(value) => setNewTranslation({...newTranslation, exercise_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.select_exercise')} />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises.map((exercise) => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name} ({exercise.body_part_slug || 'Unknown'})
                        </SelectItem>
                      ))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-name">{t('admin.name')}</Label>
                  <Input
                    id="new-name"
                    value={newTranslation.name || ""}
                    onChange={(e) => setNewTranslation({...newTranslation, name: e.target.value})}
                    placeholder={t('admin.enter_name')}
                  />
                </div>
                <div>
                  <Label htmlFor="new-description">{t('admin.description')}</Label>
                  <Textarea
                    id="new-description"
                    value={newTranslation.description || ""}
                    onChange={(e) => setNewTranslation({...newTranslation, description: e.target.value})}
                    placeholder={t('admin.enter_description')}
                  />
                </div>
                <Button 
                  onClick={() => handleSave({
                    ...newTranslation,
                    language_code: selectedLanguage
                  } as ExerciseTranslation)}
                  disabled={!newTranslation.exercise_id || !newTranslation.name}
                >
                  {t('admin.add_translation')}
                </Button>
              </CardContent>
            </Card>

            {/* Existing translations */}
            {isLoading ? (
              <div className="text-center py-8">{t('common.loading')}</div>
            ) : (
              <div className="grid gap-4">
                {translations.map((translation) => (
                  <Card key={translation.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{getExerciseName(translation.exercise_id)}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(translation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {editingTranslation?.id === translation.id ? (
                        <>
                          <div>
                            <Label htmlFor="edit-name">{t('admin.name')}</Label>
                            <Input
                              id="edit-name"
                              value={editingTranslation.name}
                              onChange={(e) => setEditingTranslation({...editingTranslation, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-description">{t('admin.description')}</Label>
                            <Textarea
                              id="edit-description"
                              value={editingTranslation.description || ""}
                              onChange={(e) => setEditingTranslation({...editingTranslation, description: e.target.value})}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleSave(editingTranslation)}>
                              {t('admin.save')}
                            </Button>
                            <Button variant="outline" onClick={() => setEditingTranslation(null)}>
                              {t('admin.cancel')}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label>{t('admin.name')}</Label>
                            <p className="text-sm">{translation.name}</p>
                          </div>
                          {translation.description && (
                            <div>
                              <Label>{t('admin.description')}</Label>
                              <p className="text-sm">{translation.description}</p>
                            </div>
                          )}
                          <Button onClick={() => setEditingTranslation(translation)}>
                            {t('admin.edit')}
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {translations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('admin.no_translations_found')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminExercisesTranslations;
