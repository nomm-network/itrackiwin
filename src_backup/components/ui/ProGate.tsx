import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsProUser } from '@/hooks/useUserProfile';
import { useUserRole } from '@/hooks/useUserRole';

interface ProGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  showProBadge?: boolean;
  hideForFree?: boolean;
}

export const ProGate = ({ 
  children, 
  fallback, 
  showProBadge = false, 
  hideForFree = false 
}: ProGateProps) => {
  const isPro = useIsProUser();
  const { isSuperAdmin } = useUserRole();
  
  // Admin always sees everything
  if (isSuperAdmin) {
    return <>{children}</>;
  }
  
  // Pro user sees everything
  if (isPro) {
    return <>{children}</>;
  }
  
  // Free user
  if (hideForFree) {
    return null;
  }
  
  if (showProBadge) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs">
          <Lock className="w-3 h-3 mr-1" />
          Pro
        </Badge>
      </div>
    );
  }
  
  return fallback || null;
};