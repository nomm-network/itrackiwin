import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface ExerciseImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
}

const ExerciseImageUploader: React.FC<ExerciseImageUploaderProps> = ({ files, onChange }) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    const newFiles = Array.from(list);
    // Merge by name + size to avoid duplicates
    const map = new Map<string, File>();
    [...files, ...newFiles].forEach((f) => map.set(`${f.name}-${f.size}`, f));
    onChange(Array.from(map.values()));
  };

  const removeAt = (idx: number) => {
    const next = files.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          Select images
        </Button>
        <Input
          ref={inputRef}
          id="images"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleSelect}
        />
        <Label htmlFor="images" className="text-muted-foreground">JPG, PNG. You can select multiple.</Label>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((file, idx) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={`${file.name}-${idx}`} className="relative rounded-md overflow-hidden border">
                <img
                  src={url}
                  alt={`Selected exercise image ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-28 object-cover"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 inline-flex items-center justify-center rounded-sm bg-background/80 backdrop-blur px-1 py-1 border"
                  onClick={() => removeAt(idx)}
                  aria-label={`Remove image ${idx + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExerciseImageUploader;
