import { useEffect } from 'react';
import { useReadinessStore } from '@/stores/readinessStore';
import { loadTodayReadiness } from '@/lib/readiness';

/**
 * Hook to automatically load today's readiness data when component mounts
 * and provide access to the readiness store
 */
export const useReadinessData = () => {
  const readiness = useReadinessStore();

  useEffect(() => {
    // Load today's readiness data on mount
    loadTodayReadiness().catch(console.error);
  }, []);

  return readiness;
};