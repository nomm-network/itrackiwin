import { Badge } from '@/components/ui/badge';
import { formatPlateMath } from '@/lib/equipment/resolve';
import { PlateProfile } from '@/lib/equipment/api';

interface PlateMathProps {
  totalWeight: number;
  profile: PlateProfile;
  className?: string;
}

export const PlateMath: React.FC<PlateMathProps> = ({ totalWeight, profile, className }) => {
  const plateMath = formatPlateMath(totalWeight, profile);

  return (
    <div className={className}>
      <div className="text-sm font-medium mb-2">Plate Loading</div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Bar:</span>
          <Badge variant="outline">{plateMath.barWeight} {profile.unit}</Badge>
        </div>
        
        {plateMath.leftSide.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Each side:</span>
            {plateMath.leftSide.map((plate, index) => (
              <Badge key={index} variant="secondary">
                {plate} {profile.unit}
              </Badge>
            ))}
          </div>
        )}
        
        {plateMath.microPlates.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Micro:</span>
            {plateMath.microPlates.map((plate, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                +{plate} {profile.unit}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground border-t pt-2">
          Total: {plateMath.total} {profile.unit}
        </div>
      </div>
    </div>
  );
};