import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useFavoriteTemplate, useToggleFavoriteTemplate } from "../hooks";

interface FavoriteTemplateButtonProps {
  templateId: string;
  className?: string;
}

export const FavoriteTemplateButton = ({ templateId, className }: FavoriteTemplateButtonProps) => {
  const { data: isFavorite, isLoading } = useFavoriteTemplate(templateId);
  const toggleFavorite = useToggleFavoriteTemplate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite.mutate({ 
          templateId, 
          isFavorite: isFavorite || false 
        });
      }}
      disabled={isLoading || toggleFavorite.isPending}
      className={`${className} ${isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground"}`}
    >
      <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
    </Button>
  );
};