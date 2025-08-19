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
import { Trash2, Plus } from "lucide-react";

interface CategoryTranslation {
  id: string;
  category_id: string;
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

interface Category {
  id: string;
  slug: string;
  display_order: number;
}

const AdminCategoriesTranslations: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [editingTranslation, setEditingTranslation] = useState<CategoryTranslation | null>(null);
  const [newTranslation, setNewTranslation] = useState<Partial<CategoryTranslation>>({});

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

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("life_categories")
        .select("id, slug, display_order")
        .order("display_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  // Fetch translations for selected language
  const { data: translations = [], isLoading } = useQuery({
    queryKey: ["category_translations", selectedLanguage],
    queryFn: async () => {
      if (!selectedLanguage) return [];
      const { data, error } = await supabase
        .from("life_category_translations")
        .select("*")
        .eq("language_code", selectedLanguage);
      if (error) throw error;
      return data as CategoryTranslation[];
    },
    enabled: !!selectedLanguage,
  });

  // Create/Update mutation
  const upsertMutation = useMutation({
    mutationFn: async (translation: CategoryTranslation) => {
      const { data, error } = await supabase
        .from("life_category_translations")
        .upsert(translation)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category_translations"] });
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
        .from("life_category_translations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category_translations"] });
      toast({ title: t('labels.translation_deleted') });
    },
    onError: (error) => {
      toast({ title: t('labels.error'), description: error.message, variant: "destructive" });
    },
  });

  const handleSave = (translation: CategoryTranslation) => {
    upsertMutation.mutate(translation);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.slug || categoryId;
  };

  return (
    <main className="container py-6">
      <PageNav current="Admin / Translations / Categories" />
      <AdminMenu />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('pages.category_translations')}</h1>
        <TranslationsMenu />
        
        <div className="flex gap-4 items-center">
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

        {selectedLanguage && (
          <div className="space-y-6">
            {/* Add new translation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {t('labels.add_new_translation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-category">{t('labels.category')}</Label>
                  <Select 
                    value={newTranslation.category_id || ""} 
                    onValueChange={(value) => setNewTranslation({...newTranslation, category_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('labels.select_category')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.slug}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-name">{t('labels.name')}</Label>
                  <Input
                    id="new-name"
                    value={newTranslation.name || ""}
                    onChange={(e) => setNewTranslation({...newTranslation, name: e.target.value})}
                    placeholder={t('labels.enter_name')}
                  />
                </div>
                <div>
                  <Label htmlFor="new-description">{t('labels.description')}</Label>
                  <Textarea
                    id="new-description"
                    value={newTranslation.description || ""}
                    onChange={(e) => setNewTranslation({...newTranslation, description: e.target.value})}
                    placeholder={t('labels.enter_description')}
                  />
                </div>
                <Button 
                  onClick={() => handleSave({
                    ...newTranslation,
                    language_code: selectedLanguage
                  } as CategoryTranslation)}
                  disabled={!newTranslation.category_id || !newTranslation.name}
                >
                  {t('labels.add_translation')}
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
                        <span>{getCategoryName(translation.category_id)}</span>
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
                            <Label htmlFor="edit-name">{t('labels.name')}</Label>
                            <Input
                              id="edit-name"
                              value={editingTranslation.name}
                              onChange={(e) => setEditingTranslation({...editingTranslation, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-description">{t('labels.description')}</Label>
                            <Textarea
                              id="edit-description"
                              value={editingTranslation.description || ""}
                              onChange={(e) => setEditingTranslation({...editingTranslation, description: e.target.value})}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleSave(editingTranslation)}>
                              {t('labels.save')}
                            </Button>
                            <Button variant="outline" onClick={() => setEditingTranslation(null)}>
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
                          <Button onClick={() => setEditingTranslation(translation)}>
                            {t('labels.edit')}
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {translations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('labels.no_translations_found')}
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

export default AdminCategoriesTranslations;
