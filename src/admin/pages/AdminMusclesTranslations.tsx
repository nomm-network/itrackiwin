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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Search } from "lucide-react";

interface Translation {
  id: string;
  language_code: string;
  name: string;
  description?: string;
}

interface BodyPartTranslation extends Translation {
  body_part_id: string;
}

interface MuscleGroupTranslation extends Translation {
  muscle_group_id: string;
}

interface MuscleTranslation extends Translation {
  muscle_id: string;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
}

interface BodyPart {
  id: string;
  slug: string;
}

interface MuscleGroup {
  id: string;
  slug: string;
  body_part_id: string;
}

interface Muscle {
  id: string;
  slug: string;
  muscle_group_id: string;
}

const AdminMusclesTranslations: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("body-parts");

  // State for editing translations
  const [editingBodyPart, setEditingBodyPart] = useState<BodyPartTranslation | null>(null);
  const [editingMuscleGroup, setEditingMuscleGroup] = useState<MuscleGroupTranslation | null>(null);
  const [editingMuscle, setEditingMuscle] = useState<MuscleTranslation | null>(null);

  // State for new translations
  const [newBodyPart, setNewBodyPart] = useState<Partial<BodyPartTranslation>>({});
  const [newMuscleGroup, setNewMuscleGroup] = useState<Partial<MuscleGroupTranslation>>({});
  const [newMuscle, setNewMuscle] = useState<Partial<MuscleTranslation>>({});

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

  // Fetch body parts
  const { data: bodyParts = [] } = useQuery({
    queryKey: ["body_parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("body_parts")
        .select("*")
        .order("slug");
      if (error) throw error;
      return data as BodyPart[];
    },
  });

  // Fetch muscle groups
  const { data: muscleGroups = [] } = useQuery({
    queryKey: ["muscle_groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("muscle_groups")
        .select("*")
        .order("slug");
      if (error) throw error;
      return data as MuscleGroup[];
    },
  });

  // Fetch muscles
  const { data: muscles = [] } = useQuery({
    queryKey: ["muscles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("muscles")
        .select("*")
        .order("slug");
      if (error) throw error;
      return data as Muscle[];
    },
  });

  // Fetch translations
  const { data: bodyPartTranslations = [] } = useQuery({
    queryKey: ["body_parts_translations", selectedLanguage],
    queryFn: async () => {
      if (!selectedLanguage) return [];
      const { data, error } = await supabase
        .from("body_parts_translations")
        .select("*")
        .eq("language_code", selectedLanguage);
      if (error) throw error;
      return data as BodyPartTranslation[];
    },
    enabled: !!selectedLanguage,
  });

  const { data: muscleGroupTranslations = [] } = useQuery({
    queryKey: ["muscle_groups_translations", selectedLanguage],
    queryFn: async () => {
      if (!selectedLanguage) return [];
      const { data, error } = await supabase
        .from("muscle_groups_translations")
        .select("*")
        .eq("language_code", selectedLanguage);
      if (error) throw error;
      return data as MuscleGroupTranslation[];
    },
    enabled: !!selectedLanguage,
  });

  const { data: muscleTranslations = [] } = useQuery({
    queryKey: ["muscles_translations", selectedLanguage],
    queryFn: async () => {
      if (!selectedLanguage) return [];
      const { data, error } = await supabase
        .from("muscles_translations")
        .select("*")
        .eq("language_code", selectedLanguage);
      if (error) throw error;
      return data as MuscleTranslation[];
    },
    enabled: !!selectedLanguage,
  });

  // Mutations
  const createBodyPartTranslationMutation = useMutation({
    mutationFn: async (translation: BodyPartTranslation) => {
      const { data, error } = await supabase
        .from("body_parts_translations")
        .upsert(translation)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["body_parts_translations"] });
      setEditingBodyPart(null);
      setNewBodyPart({});
      toast({ title: t('labels.translation_saved') });
    },
  });

  const createMuscleGroupTranslationMutation = useMutation({
    mutationFn: async (translation: MuscleGroupTranslation) => {
      const { data, error } = await supabase
        .from("muscle_groups_translations")
        .upsert(translation)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["muscle_groups_translations"] });
      setEditingMuscleGroup(null);
      setNewMuscleGroup({});
      toast({ title: t('labels.translation_saved') });
    },
  });

  const createMuscleTranslationMutation = useMutation({
    mutationFn: async (translation: MuscleTranslation) => {
      const { data, error } = await supabase
        .from("muscles_translations")
        .upsert(translation)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["muscles_translations"] });
      setEditingMuscle(null);
      setNewMuscle({});
      toast({ title: t('labels.translation_saved') });
    },
  });

  // Delete mutations
  const deleteBodyPartTranslationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("body_parts_translations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["body_parts_translations"] });
      toast({ title: t('labels.translation_deleted') });
    },
  });

  const deleteMuscleGroupTranslationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("muscle_groups_translations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["muscle_groups_translations"] });
      toast({ title: t('labels.translation_deleted') });
    },
  });

  const deleteMuscleTranslationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("muscles_translations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["muscles_translations"] });
      toast({ title: t('labels.translation_deleted') });
    },
  });

  const getBodyPartSlug = (id: string) => {
    return bodyParts.find(bp => bp.id === id)?.slug || id;
  };

  const getMuscleGroupSlug = (id: string) => {
    return muscleGroups.find(mg => mg.id === id)?.slug || id;
  };

  const getMuscleSlug = (id: string) => {
    return muscles.find(m => m.id === id)?.slug || id;
  };

  const renderBodyPartsTab = () => (
    <div className="space-y-6">
      {/* Add new body part translation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('labels.add_new_translation')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('labels.body_part')}</Label>
            <Select 
              value={newBodyPart.body_part_id || ""} 
              onValueChange={(value) => setNewBodyPart({...newBodyPart, body_part_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select body part" />
              </SelectTrigger>
              <SelectContent>
                {bodyParts
                  .filter(bodyPart => !bodyPartTranslations.some(t => t.body_part_id === bodyPart.id))
                  .map((bodyPart) => (
                    <SelectItem key={bodyPart.id} value={bodyPart.id}>
                      {bodyPart.slug}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('labels.name')}</Label>
            <Input
              value={newBodyPart.name || ""}
              onChange={(e) => setNewBodyPart({...newBodyPart, name: e.target.value})}
              placeholder={t('labels.enter_name')}
            />
          </div>
          <div>
            <Label>{t('labels.description')}</Label>
            <Textarea
              value={newBodyPart.description || ""}
              onChange={(e) => setNewBodyPart({...newBodyPart, description: e.target.value})}
              placeholder={t('labels.enter_description')}
            />
          </div>
          <Button 
            onClick={() => createBodyPartTranslationMutation.mutate({
              ...newBodyPart,
              language_code: selectedLanguage
            } as BodyPartTranslation)}
            disabled={!newBodyPart.body_part_id || !newBodyPart.name}
          >
            {t('labels.add_translation')}
          </Button>
        </CardContent>
      </Card>

      {/* Existing body part translations */}
      <div className="grid gap-4">
        {bodyPartTranslations.map((translation) => (
          <Card key={translation.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{getBodyPartSlug(translation.body_part_id)}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteBodyPartTranslationMutation.mutate(translation.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingBodyPart?.id === translation.id ? (
                <>
                  <div>
                    <Label>{t('labels.name')}</Label>
                    <Input
                      value={editingBodyPart.name}
                      onChange={(e) => setEditingBodyPart({...editingBodyPart, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{t('labels.description')}</Label>
                    <Textarea
                      value={editingBodyPart.description || ""}
                      onChange={(e) => setEditingBodyPart({...editingBodyPart, description: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => createBodyPartTranslationMutation.mutate(editingBodyPart)}>
                      {t('labels.save')}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingBodyPart(null)}>
                      {t('labels.cancel')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>{t('labels.name')}</Label>
                    <p className="text-sm">{translation.name}</p>
                  </div>
                  {translation.description && (
                    <div>
                      <Label>{t('labels.description')}</Label>
                      <p className="text-sm">{translation.description}</p>
                    </div>
                  )}
                  <Button onClick={() => setEditingBodyPart(translation)}>
                    {t('labels.edit')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
        {bodyPartTranslations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {t('labels.no_translations_found')}
          </div>
        )}
      </div>
    </div>
  );

  const renderMuscleGroupsTab = () => (
    <div className="space-y-6">
      {/* Add new muscle group translation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('labels.add_new_translation')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('labels.muscle_group')}</Label>
            <Select 
              value={newMuscleGroup.muscle_group_id || ""} 
              onValueChange={(value) => setNewMuscleGroup({...newMuscleGroup, muscle_group_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select muscle group" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups
                  .filter(muscleGroup => !muscleGroupTranslations.some(t => t.muscle_group_id === muscleGroup.id))
                  .map((muscleGroup) => (
                    <SelectItem key={muscleGroup.id} value={muscleGroup.id}>
                      {muscleGroup.slug}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('labels.name')}</Label>
            <Input
              value={newMuscleGroup.name || ""}
              onChange={(e) => setNewMuscleGroup({...newMuscleGroup, name: e.target.value})}
              placeholder={t('labels.enter_name')}
            />
          </div>
          <div>
            <Label>{t('labels.description')}</Label>
            <Textarea
              value={newMuscleGroup.description || ""}
              onChange={(e) => setNewMuscleGroup({...newMuscleGroup, description: e.target.value})}
              placeholder={t('labels.enter_description')}
            />
          </div>
          <Button 
            onClick={() => createMuscleGroupTranslationMutation.mutate({
              ...newMuscleGroup,
              language_code: selectedLanguage
            } as MuscleGroupTranslation)}
            disabled={!newMuscleGroup.muscle_group_id || !newMuscleGroup.name}
          >
            {t('labels.add_translation')}
          </Button>
        </CardContent>
      </Card>

      {/* Existing muscle group translations */}
      <div className="grid gap-4">
        {muscleGroupTranslations.map((translation) => (
          <Card key={translation.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{getMuscleGroupSlug(translation.muscle_group_id)}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMuscleGroupTranslationMutation.mutate(translation.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingMuscleGroup?.id === translation.id ? (
                <>
                  <div>
                    <Label>{t('labels.name')}</Label>
                    <Input
                      value={editingMuscleGroup.name}
                      onChange={(e) => setEditingMuscleGroup({...editingMuscleGroup, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{t('labels.description')}</Label>
                    <Textarea
                      value={editingMuscleGroup.description || ""}
                      onChange={(e) => setEditingMuscleGroup({...editingMuscleGroup, description: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => createMuscleGroupTranslationMutation.mutate(editingMuscleGroup)}>
                      {t('labels.save')}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingMuscleGroup(null)}>
                      {t('labels.cancel')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>{t('labels.name')}</Label>
                    <p className="text-sm">{translation.name}</p>
                  </div>
                  {translation.description && (
                    <div>
                      <Label>{t('labels.description')}</Label>
                      <p className="text-sm">{translation.description}</p>
                    </div>
                  )}
                  <Button onClick={() => setEditingMuscleGroup(translation)}>
                    {t('labels.edit')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
        {muscleGroupTranslations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {t('labels.no_translations_found')}
          </div>
        )}
      </div>
    </div>
  );

  const renderMusclesTab = () => (
    <div className="space-y-6">
      {/* Add new muscle translation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('labels.add_new_translation')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('labels.muscle')}</Label>
            <Select 
              value={newMuscle.muscle_id || ""} 
              onValueChange={(value) => setNewMuscle({...newMuscle, muscle_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select muscle" />
              </SelectTrigger>
              <SelectContent>
                {muscles
                  .filter(muscle => !muscleTranslations.some(t => t.muscle_id === muscle.id))
                  .map((muscle) => (
                    <SelectItem key={muscle.id} value={muscle.id}>
                      {muscle.slug}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('labels.name')}</Label>
            <Input
              value={newMuscle.name || ""}
              onChange={(e) => setNewMuscle({...newMuscle, name: e.target.value})}
              placeholder={t('labels.enter_name')}
            />
          </div>
          <div>
            <Label>{t('labels.description')}</Label>
            <Textarea
              value={newMuscle.description || ""}
              onChange={(e) => setNewMuscle({...newMuscle, description: e.target.value})}
              placeholder={t('labels.enter_description')}
            />
          </div>
          <Button 
            onClick={() => createMuscleTranslationMutation.mutate({
              ...newMuscle,
              language_code: selectedLanguage
            } as MuscleTranslation)}
            disabled={!newMuscle.muscle_id || !newMuscle.name}
          >
            {t('labels.add_translation')}
          </Button>
        </CardContent>
      </Card>

      {/* Existing muscle translations */}
      <div className="grid gap-4">
        {muscleTranslations.map((translation) => (
          <Card key={translation.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{getMuscleSlug(translation.muscle_id)}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMuscleTranslationMutation.mutate(translation.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingMuscle?.id === translation.id ? (
                <>
                  <div>
                    <Label>{t('labels.name')}</Label>
                    <Input
                      value={editingMuscle.name}
                      onChange={(e) => setEditingMuscle({...editingMuscle, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{t('labels.description')}</Label>
                    <Textarea
                      value={editingMuscle.description || ""}
                      onChange={(e) => setEditingMuscle({...editingMuscle, description: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => createMuscleTranslationMutation.mutate(editingMuscle)}>
                      {t('labels.save')}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingMuscle(null)}>
                      {t('labels.cancel')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>{t('labels.name')}</Label>
                    <p className="text-sm">{translation.name}</p>
                  </div>
                  {translation.description && (
                    <div>
                      <Label>{t('labels.description')}</Label>
                      <p className="text-sm">{translation.description}</p>
                    </div>
                  )}
                  <Button onClick={() => setEditingMuscle(translation)}>
                    {t('labels.edit')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
        {muscleTranslations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {t('labels.no_translations_found')}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="container py-6">
      <PageNav current="Admin / Translations / Muscles" />
      <AdminMenu />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('pages.muscle_translations')}</h1>
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
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedLanguage && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="body-parts">Body Parts</TabsTrigger>
              <TabsTrigger value="muscle-groups">Muscle Groups</TabsTrigger>
              <TabsTrigger value="muscles">Muscles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="body-parts">
              {renderBodyPartsTab()}
            </TabsContent>
            
            <TabsContent value="muscle-groups">
              {renderMuscleGroupsTab()}
            </TabsContent>
            
            <TabsContent value="muscles">
              {renderMusclesTab()}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
};

export default AdminMusclesTranslations;
