import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CarouselImage {
  id: string;
  title: string;
  alt_text: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
}

export const CarouselImagesList: React.FC = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<CarouselImage[]>([
    {
      id: "1",
      title: "Pre-workout Check",
      alt_text: "Pre-workout check interface",
      image_url: "/assets/fitness-carousel-1.png",
      order_index: 1,
      is_active: true,
    },
    {
      id: "2", 
      title: "Warm-up Tracking",
      alt_text: "Warm-up exercise tracking",
      image_url: "/assets/fitness-carousel-2.png",
      order_index: 2,
      is_active: true,
    },
    {
      id: "3",
      title: "Workout Progress",
      alt_text: "Workout progress tracking", 
      image_url: "/assets/fitness-carousel-3.png",
      order_index: 3,
      is_active: true,
    },
  ]);

  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = (imageData: Partial<CarouselImage>) => {
    if (editingImage) {
      // Update existing image
      setImages(prev => prev.map(img => 
        img.id === editingImage.id 
          ? { ...img, ...imageData }
          : img
      ));
      toast({
        title: "Image updated",
        description: "Carousel image has been updated successfully.",
      });
    } else {
      // Add new image
      const newImage: CarouselImage = {
        id: Date.now().toString(),
        title: imageData.title || "",
        alt_text: imageData.alt_text || "",
        image_url: imageData.image_url || "",
        order_index: images.length + 1,
        is_active: true,
      };
      setImages(prev => [...prev, newImage]);
      toast({
        title: "Image added",
        description: "New carousel image has been added successfully.",
      });
    }
    
    setEditingImage(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    toast({
      title: "Image deleted",
      description: "Carousel image has been deleted successfully.",
    });
  };

  const handleEdit = (image: CarouselImage) => {
    setEditingImage(image);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingImage(null);
    setIsDialogOpen(true);
  };

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
                  {image.image_url ? (
                    <img
                      src={image.image_url}
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
  onSave: (data: Partial<CarouselImage>) => void;
  onCancel: () => void;
}

const ImageForm: React.FC<ImageFormProps> = ({ image, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: image?.title || "",
    alt_text: image?.alt_text || "",
    image_url: image?.image_url || "",
    order_index: image?.order_index || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
        />
      </div>

      <div>
        <Label htmlFor="alt_text">Alt Text</Label>
        <Textarea
          id="alt_text"
          value={formData.alt_text}
          onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
          placeholder="Describe the image for accessibility"
        />
      </div>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          value={formData.image_url}
          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
          placeholder="Enter image URL"
        />
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