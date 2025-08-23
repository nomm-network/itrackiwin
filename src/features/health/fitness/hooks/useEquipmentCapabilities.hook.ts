import { useQuery } from '@tanstack/react-query';
import { getEquipmentCapabilities, type EquipmentCapabilities } from '../services/equipmentCapabilities.service';

export function useEquipmentCapabilities(userId?: string) {
  return useQuery({
    queryKey: ['equipment-capabilities', userId],
    queryFn: () => getEquipmentCapabilities(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export type { EquipmentCapabilities };