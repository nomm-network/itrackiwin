import React from "react";
import PageNav from "@/components/PageNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const useSEO = () => {
  React.useEffect(() => {
    document.title = "Exercises | I Track I Win";
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Create custom exercises and upload images in I Track I Win.');
    document.head.appendChild(desc);

    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', `${window.location.origin}/fitness/exercises`);
    document.head.appendChild(link);
  }, []);
};

const Exercises: React.FC = () => {
  useSEO();
  const { toast } = useToast();

  const [name, setName] = React.useState("");
  const [primaryMuscle, setPrimaryMuscle] = React.useState("");
  const [bodyPart, setBodyPart] = React.useState("");
  const [equipment, setEquipment] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [sourceUrl, setSourceUrl] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(true);
  const [files, setFiles] = React.useState<File[]>([]);
  const [saving, setSaving] = React.useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files ?? []);
    setFiles(f);
  };

  const onAdd = async () => {
    if (!name.trim()) {
      toast({ title: "Name is required" });
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1) Create exercise
      const { data: ex, error: e1 } = await supabase
        .from("exercises")
        .insert({
          name: name.trim(),
          description: description || null,
          equipment: equipment || null,
          primary_muscle: primaryMuscle || null,
          body_part: bodyPart || null,
          source_url: sourceUrl || null,
          is_public: isPublic,
          owner_user_id: user.id,
        })
        .select("id")
        .single();
      if (e1) throw e1;
      const exerciseId = (ex as any).id as string;

      let firstUrl: string | null = null;
      // 2) Upload images (optional)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `${user.id}/${exerciseId}/${Date.now()}-${i}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("exercise-images")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("exercise-images").getPublicUrl(path);
        const url = pub.publicUrl;
        if (!firstUrl) firstUrl = url;
        const { error: e2 } = await supabase.from("exercise_images").insert({
          user_id: user.id,
          exercise_id: exerciseId,
          url,
          path,
          is_primary: i === 0,
          order_index: i + 1,
        });
        if (e2) throw e2;
      }

      // 3) Set thumbnail on exercise
      if (firstUrl) {
        const { error: e3 } = await supabase
          .from("exercises")
          .update({ image_url: firstUrl, thumbnail_url: firstUrl })
          .eq("id", exerciseId)
          .eq("owner_user_id", user.id);
        if (e3) throw e3;
      }

      toast({ title: "Exercise added", description: files.length ? `Uploaded ${files.length} image(s)` : undefined });
      // Reset form
      setName("");
      setPrimaryMuscle("");
      setBodyPart("");
      setEquipment("");
      setDescription("");
      setSourceUrl("");
      setIsPublic(true);
      setFiles([]);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to add exercise", description: e?.message ?? "Unknown error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageNav current="Fitness" />
      <main className="container py-8">
        <h1 className="text-2xl font-semibold mb-6">Exercises</h1>
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Add Exercise</CardTitle>
              <CardDescription>Fill the fields and optionally upload images.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="e.g., Barbell Bench Press" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_muscle">Primary muscle</Label>
                  <Input id="primary_muscle" placeholder="e.g., Chest" value={primaryMuscle} onChange={(e) => setPrimaryMuscle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body_part">Body part</Label>
                  <Input id="body_part" placeholder="e.g., Upper body" value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment</Label>
                  <Input id="equipment" placeholder="e.g., Barbell" value={equipment} onChange={(e) => setEquipment(e.target.value)} />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="description">Description / cues</Label>
                  <Textarea id="description" placeholder="How to perform it..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source_url">Source URL (optional)</Label>
                  <Input id="source_url" placeholder="https://..." value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="is_public" checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label htmlFor="is_public">Public</Label>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="images">Images</Label>
                  <Input id="images" type="file" multiple accept="image/*" onChange={onFileChange} />
                  {files.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                      {files.map((f, i) => (
                        <div key={i} className="text-xs text-muted-foreground truncate" title={f.name}>
                          {f.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-2">
                <Button onClick={onAdd} disabled={saving} aria-label="Add Exercise">
                  {saving ? "Saving…" : "Add exercise"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default Exercises;
