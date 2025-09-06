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
import { useTranslations } from "@/hooks/useTranslations";

interface SubcategoryTranslation {
  id: string;
  subcategory_id: string;
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
  translations: Record<string, { name: string; description?: string }> | null;
}

interface Subcategory {
  id: string;
  category_id: string;
  slug: string;
  display_order: number;
}

const AdminSubcategoriesTranslations: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { getTranslatedName } = useTranslations();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [editingTranslation, setEditingTranslation] = useState<SubcategoryTranslation | null>(null);
  const [newTranslation, setNewTranslation] = useState<Partial<SubcategoryTranslation>>({});

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
    queryKey: ["categories_with_translations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_categories_with_translations")
        .select("id, slug, translations")
        .order("display_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  // Fetch subcategories for selected category
  const { data: subcategories = [] } = useQuery({
    queryKey: ["subcategories", selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from("life_subcategories")
        .select("id, category_id, slug, display_order")
        .eq("category_id", selectedCategory)
        .order("display_order");
      if (error) throw error;
      return data as Subcategory[];
    },
    enabled: !!selectedCategory,
  });

  // Fetch translations for selected language and category
  const { data: translations = [], isLoading } = useQuery({
    queryKey: ["subcategory_translations", selectedLanguage, selectedCategory],
    queryFn: async () => {
      if (!selectedLanguage || !selectedCategory) return [];
      const subcategoryIds = subcategories.map(s => s.id);
      if (subcategoryIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("life_subcategory_translations")
        .select("*")
        .eq("language_code", selectedLanguage)
        .in("subcategory_id", subcategoryIds);
      if (error) throw error;
      return data as SubcategoryTranslation[];
    },
    enabled: !!selectedLanguage && !!selectedCategory && subcategories.length > 0,
  });

  // Create/Update mutation
  const upsertMutation = useMutation({
    mutationFn: async (translation: SubcategoryTranslation) => {
      const { data, error } = await supabase
        .from("life_subcategory_translations")
        .upsert(translation)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategory_translations"] });
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
        .from("life_subcategory_translations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategory_translations"] });
      toast({ title: t('labels.translation_deleted') });
    },
    onError: (error) => {
      toast({ title: t('labels.error'), description: error.message, variant: "destructive" });
    },
  });

  const handleSave = (translation: SubcategoryTranslation) => {
    upsertMutation.mutate(translation);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    return subcategory?.slug || subcategoryId;
  };

  return (
    <main className="container py-6">
      <PageNav current="Admin / Translations / Subcategories" />
      <AdminMenu />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('pages.subcategory_translations')}</h1>
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
          
          <div className="flex gap-2 items-center">
            <Label htmlFor="category-select">{t('labels.select_category')}</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('labels.select_category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {getTranslatedName(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedLanguage && selectedCategory && (
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
                  <Label htmlFor="new-subcategory">{t('admin.subcategory')}</Label>
                  <Select 
                    value={newTranslation.subcategory_id || ""} 
                    onValueChange={(value) => setNewTranslation({...newTranslation, subcategory_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.select_subcategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.slug}
                        </SelectItem>
                      ))}
                    </SelectContent>
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
                  } as SubcategoryTranslation)}
                  disabled={!newTranslation.subcategory_id || !newTranslation.name}
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
                        <span>{getSubcategoryName(translation.subcategory_id)}</span>
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
                {translations.length === 0 && subcategories.length > 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('admin.no_translations_found')}
                  </div>
                )}
                {subcategories.length === 0 && selectedCategory && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('admin.no_subcategories_found')}
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

export default AdminSubcategoriesTranslations;
