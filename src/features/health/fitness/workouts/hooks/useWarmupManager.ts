// Warmup manager hook - stub for migration
export const useWarmupManager = () => {
  return {
    saveFeedback: async (data: any) => {
      console.log('useWarmupManager.saveFeedback stub:', data);
    },
    isLoading: false
  };
};