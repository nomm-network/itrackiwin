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

interface EquipmentTranslation extends Translation {
  equipment_id: string;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
}

interface Equipment {
  id: string;
  slug: string;
}

const AdminEquipmentTranslations: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // State for editing translations
  const [editingEquipment, setEditingEquipment] = useState<EquipmentTranslation | null>(null);

  // State for new translations
  const [newEquipment, setNewEquipment] = useState<Partial<EquipmentTranslation>>({});

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

  // Fetch equipment
  const { data: equipment = [] } = useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("slug");
      if (error) throw error;
      return data as Equipment[];
    },
  });

  // Fetch translations
  const { data: equipmentTranslations = [] } = useQuery({
    queryKey: ["equipment_translations", selectedLanguage],
    queryFn: async () => {
      if (!selectedLanguage) return [];
      const { data, error } = await supabase
        .from("equipment_translations")
        .select("*")
        .eq("language_code", selectedLanguage);
      if (error) throw error;
      return data as EquipmentTranslation[];
    },
    enabled: !!selectedLanguage,
  });

  // Mutations
  const createEquipmentTranslationMutation = useMutation({
    mutationFn: async (translation: EquipmentTranslation) => {
      const { data, error } = await supabase
        .from("equipment_translations")
        .upsert(translation)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment_translations"] });
      setEditingEquipment(null);
      setNewEquipment({});
      toast({ title: t('labels.translation_saved') });
    },
  });

  // Delete mutations
  const deleteEquipmentTranslationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("equipment_translations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment_translations"] });
      toast({ title: t('labels.translation_deleted') });
    },
  });

  const getEquipmentSlug = (id: string) => {
    return equipment.find(e => e.id === id)?.slug || id;
  };

  return (
    <main className="container py-6">
      <PageNav current="Admin / Translations / Equipment" />
      <AdminMenu />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('navigation.translations')} - Equipment</h1>
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
                placeholder={t('labels.search_equipment')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {selectedLanguage && (
          <div className="space-y-6">
            {/* Add new equipment translation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {t('labels.add_new_translation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('labels.equipment')}</Label>
                  <Select 
                    value={newEquipment.equipment_id || ""} 
                    onValueChange={(value) => setNewEquipment({...newEquipment, equipment_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment
                        .filter(eq => !equipmentTranslations.some(t => t.equipment_id === eq.id))
                        .map((eq) => (
                          <SelectItem key={eq.id} value={eq.id}>
                            {eq.slug}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('labels.name')}</Label>
                  <Input
                    value={newEquipment.name || ""}
                    onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                    placeholder={t('labels.enter_name')}
                  />
                </div>
                <div>
                  <Label>{t('labels.description')}</Label>
                  <Textarea
                    value={newEquipment.description || ""}
                    onChange={(e) => setNewEquipment({...newEquipment, description: e.target.value})}
                    placeholder={t('labels.enter_description')}
                  />
                </div>
                <Button 
                  onClick={() => createEquipmentTranslationMutation.mutate({
                    ...newEquipment,
                    language_code: selectedLanguage
                  } as EquipmentTranslation)}
                  disabled={!newEquipment.equipment_id || !newEquipment.name}
                >
                  {t('labels.add_translation')}
                </Button>
              </CardContent>
            </Card>

            {/* Existing equipment translations */}
            <div className="grid gap-4">
              {equipmentTranslations.map((translation) => (
                <Card key={translation.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{getEquipmentSlug(translation.equipment_id)}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteEquipmentTranslationMutation.mutate(translation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingEquipment?.id === translation.id ? (
                      <>
                        <div>
                          <Label>{t('labels.name')}</Label>
                          <Input
                            value={editingEquipment.name}
                            onChange={(e) => setEditingEquipment({...editingEquipment, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>{t('labels.description')}</Label>
                          <Textarea
                            value={editingEquipment.description || ""}
                            onChange={(e) => setEditingEquipment({...editingEquipment, description: e.target.value})}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => createEquipmentTranslationMutation.mutate(editingEquipment)}>
                            {t('labels.save')}
                          </Button>
                          <Button variant="outline" onClick={() => setEditingEquipment(null)}>
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
                        <Button onClick={() => setEditingEquipment(translation)}>
                          {t('labels.edit')}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
              }
              {equipmentTranslations.length === 0 && (
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

export default AdminEquipmentTranslations;
