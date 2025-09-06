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

interface Translation {
  id: string;
  language_code: string;
  name: string;
  description?: string;
}

interface GripTranslation extends Translation {
  grip_id: string;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
}

interface Grip {
  id: string;
  slug: string;
  category: string;
}

const AdminGripsTranslations: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // State for editing translations
  const [editingGrip, setEditingGrip] = useState<GripTranslation | null>(null);

  // State for new translations
  const [newGrip, setNewGrip] = useState<Partial<GripTranslation>>({});

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

  // Fetch grips
  const { data: grips = [] } = useQuery({
    queryKey: ["grips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grips")
        .select("*")
        .order("slug");
      if (error) throw error;
      return data as Grip[];
    },
  });

  // Fetch translations
  const { data: gripTranslations = [] } = useQuery({
    queryKey: ["grips_translations", selectedLanguage],
    queryFn: async () => {
      if (!selectedLanguage) return [];
      const { data, error } = await supabase
        .from("grips_translations")
        .select("*")
        .eq("language_code", selectedLanguage);
      if (error) throw error;
      return data as GripTranslation[];
    },
    enabled: !!selectedLanguage,
  });

  // Mutations
  const createGripTranslationMutation = useMutation({
    mutationFn: async (translation: GripTranslation) => {
      const { data, error } = await supabase
        .from("grips_translations")
        .upsert(translation)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grips_translations"] });
      setEditingGrip(null);
      setNewGrip({});
      toast({ title: t('labels.translation_saved') });
    },
  });

  // Delete mutations
  const deleteGripTranslationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("grips_translations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grips_translations"] });
      toast({ title: t('labels.translation_deleted') });
    },
  });

  const getGripSlug = (id: string) => {
    return grips.find(g => g.id === id)?.slug || id;
  };

  return (
    <main className="container py-6">
      <PageNav current="Admin / Translations / Grips" />
      <AdminMenu />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('navigation.translations')} - Grips</h1>
        <TranslationsMenu />

        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Label htmlFor="language-select">{t('labels.select_language')}</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder={t('labels.select_language')} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.native_name} ({lang.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="search">{t('labels.search')}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={t('labels.search_grips')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {selectedLanguage && (
          <div className="space-y-6">
            {/* Add new grip translation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {t('labels.add_new_translation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('labels.grip')}</Label>
                  <Select 
                    value={newGrip.grip_id || ""} 
                    onValueChange={(value) => setNewGrip({...newGrip, grip_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grip" />
                    </SelectTrigger>
                    <SelectContent>
                      {grips
                        .filter(grip => !gripTranslations.some(t => t.grip_id === grip.id))
                        .map((grip) => (
                          <SelectItem key={grip.id} value={grip.id}>
                            {grip.slug} ({grip.category})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('labels.name')}</Label>
                  <Input
                    value={newGrip.name || ""}
                    onChange={(e) => setNewGrip({...newGrip, name: e.target.value})}
                    placeholder={t('labels.enter_name')}
                  />
                </div>
                <div>
                  <Label>{t('labels.description')}</Label>
                  <Textarea
                    value={newGrip.description || ""}
                    onChange={(e) => setNewGrip({...newGrip, description: e.target.value})}
                    placeholder={t('labels.enter_description')}
                  />
                </div>
                <Button 
                  onClick={() => createGripTranslationMutation.mutate({
                    ...newGrip,
                    language_code: selectedLanguage
                  } as GripTranslation)}
                  disabled={!newGrip.grip_id || !newGrip.name}
                >
                  {t('labels.add_translation')}
                </Button>
              </CardContent>
            </Card>

            {/* Existing grip translations */}
            <div className="grid gap-4">
              {gripTranslations.map((translation) => (
                <Card key={translation.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{getGripSlug(translation.grip_id)}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteGripTranslationMutation.mutate(translation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingGrip?.id === translation.id ? (
                      <>
                        <div>
                          <Label>{t('labels.name')}</Label>
                          <Input
                            value={editingGrip.name}
                            onChange={(e) => setEditingGrip({...editingGrip, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>{t('labels.description')}</Label>
                          <Textarea
                            value={editingGrip.description || ""}
                            onChange={(e) => setEditingGrip({...editingGrip, description: e.target.value})}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => createGripTranslationMutation.mutate(editingGrip)}>
                            {t('labels.save')}
                          </Button>
                          <Button variant="outline" onClick={() => setEditingGrip(null)}>
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
                        <Button onClick={() => setEditingGrip(translation)}>
                          {t('labels.edit')}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
              {gripTranslations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('labels.no_translations_found')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminGripsTranslations;
