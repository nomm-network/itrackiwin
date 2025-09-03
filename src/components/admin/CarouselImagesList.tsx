import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Image, Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CarouselImage {
  id: string;
  title: string;
  alt_text: string;
  file_path: string;
  file_url: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const CarouselImagesList: React.FC = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
      toast({
        title: "Error",
        description: "Failed to fetch carousel images.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (imageData: Partial<CarouselImage>, file?: File) => {
    try {
      let fileUrl = imageData.file_url;
      let filePath = imageData.file_path;

      // Handle file upload if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        filePath = `carousel-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('carousel-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('carousel-images')
          .getPublicUrl(fileName);

        fileUrl = publicUrl;
      }

      if (editingImage) {
        // Update existing image
        const { error } = await supabase
          .from('carousel_images')
          .update({
            ...imageData,
            file_path: filePath,
            file_url: fileUrl,
          })
          .eq('id', editingImage.id);

        if (error) throw error;

        toast({
          title: "Image updated",
          description: "Carousel image has been updated successfully.",
        });
      } else {
        // Add new image
        const { error } = await supabase
          .from('carousel_images')
          .insert({
            title: imageData.title || "",
            alt_text: imageData.alt_text || "",
            file_path: filePath || "",
            file_url: fileUrl || "",
            order_index: imageData.order_index || images.length + 1,
            is_active: true,
          });

        if (error) throw error;

        toast({
          title: "Image added",
          description: "New carousel image has been added successfully.",
        });
      }

      await fetchImages();
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: "Error",
        description: "Failed to save carousel image.",
        variant: "destructive",
      });
    }
    
    setEditingImage(null);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      // Get the image to delete its file from storage
      const imageToDelete = images.find(img => img.id === id);
      
      if (imageToDelete?.file_path && imageToDelete.file_path.startsWith('carousel-images/')) {
        const fileName = imageToDelete.file_path.replace('carousel-images/', '');
        await supabase.storage
          .from('carousel-images')
          .remove([fileName]);
      }

      const { error } = await supabase
        .from('carousel_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchImages();
      toast({
        title: "Image deleted",
        description: "Carousel image has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete carousel image.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (image: CarouselImage) => {
    setEditingImage(image);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingImage(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading carousel images...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Carousel Images</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingImage ? "Edit Image" : "Add New Image"}
              </DialogTitle>
            </DialogHeader>
            <ImageForm
              image={editingImage}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {images.map((image) => (
          <Card key={image.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{image.title}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(image)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {image.file_url ? (
                    <img
                      src={image.file_url}
                      alt={image.alt_text}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-md border flex items-center justify-center">
                      <Image className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-muted-foreground">{image.alt_text}</p>
                  <p className="text-xs text-muted-foreground">Order: {image.order_index}</p>
                  <p className="text-xs text-muted-foreground">
                    Status: {image.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface ImageFormProps {
  image: CarouselImage | null;
  onSave: (data: Partial<CarouselImage>, file?: File) => void;
  onCancel: () => void;
}

const ImageForm: React.FC<ImageFormProps> = ({ image, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: image?.title || "",
    alt_text: image?.alt_text || "",
    order_index: image?.order_index || 1,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(image?.file_url || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(image?.file_url || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.alt_text.trim()) {
      return; // Basic validation
    }
    onSave(formData, selectedFile || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter image title"
          required
        />
      </div>

      <div>
        <Label htmlFor="alt_text">Alt Text</Label>
        <Textarea
          id="alt_text"
          value={formData.alt_text}
          onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
          placeholder="Describe the image for accessibility"
          required
        />
      </div>

      <div>
        <Label htmlFor="image-upload">Upload Image</Label>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-1"
            />
            {selectedFile && (
              <Button type="button" variant="outline" size="sm" onClick={clearFile}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {previewUrl && (
            <div className="relative w-32 h-32 border rounded-md overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="order_index">Order Index</Label>
        <Input
          id="order_index"
          type="number"
          value={formData.order_index}
          onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 1 }))}
          min="1"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {image ? "Update" : "Add"} Image
        </Button>
      </div>
    </form>
  );
};