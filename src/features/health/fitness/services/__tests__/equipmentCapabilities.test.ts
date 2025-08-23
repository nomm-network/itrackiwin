import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEquipmentCapabilities, hasEquipment, getAvailableWeights } from '../equipmentCapabilities.service';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
            eq: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('Equipment Capabilities Service', () => {
  const mockUserId = 'test-user-id';
  let mockSupabaseFrom: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const { supabase } = require('@/integrations/supabase/client');
    mockSupabaseFrom = supabase.from;
  });

  describe('getEquipmentCapabilities', () => {
    it('should return default capabilities when no gym is found', async () => {
      // Mock no gym found
      mockSupabaseFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null })
            })
          })
        })
      });

      const capabilities = await getEquipmentCapabilities(mockUserId);

      expect(capabilities).toEqual({
        bars: { available: false, weights: [], defaultWeight: 20 },
        plates: { available: false, weights: [], miniweights: [] },
        dumbbells: { available: false, weights: [], increment: 2.5 },
        machines: { available: false, stacks: {} },
        cables: { available: false, increment: 5 }
      });
    });

    it('should handle barbell-only gym setup', async () => {
      // Mock gym with ID
      const mockGymId = 'gym-1';
      
      let callCount = 0;
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'user_gyms') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({ 
                    data: { gym_id: mockGymId, is_default: true } 
                  })
                })
              })
            })
          };
        }
        
        // Mock Promise.all responses for equipment tables
        if (callCount === 0) {
          callCount++;
          return Promise.resolve({ data: [] }); // dumbbells
        } else if (callCount === 1) {
          callCount++;
          return Promise.resolve({ 
            data: [{ weight: 20 }, { weight: 15 }, { weight: 10 }] // plates
          });
        } else if (callCount === 2) {
          callCount++;
          return Promise.resolve({ 
            data: [{ bar_type_id: '1', bar_types: { default_weight: 20 } }] // bars
          });
        } else if (callCount === 3) {
          callCount++;
          return Promise.resolve({ data: [] }); // machines
        } else {
          return Promise.resolve({ data: [] }); // miniweights
        }
      });

      // Mock the Promise.all by overriding the implementation
      const originalPromiseAll = Promise.all;
      vi.spyOn(Promise, 'all').mockImplementation((promises: any) => {
        return originalPromiseAll.call(Promise, [
          Promise.resolve({ data: [] }), // dumbbells
          Promise.resolve({ data: [{ weight: 20 }, { weight: 15 }, { weight: 10 }] }), // plates
          Promise.resolve({ data: [{ bar_type_id: '1', bar_types: { default_weight: 20 } }] }), // bars
          Promise.resolve({ data: [] }), // machines
          Promise.resolve({ data: [{ weight: 0.5 }, { weight: 1.25 }] }) // miniweights
        ]);
      });

      const capabilities = await getEquipmentCapabilities(mockUserId);

      expect(capabilities.bars.available).toBe(true);
      expect(capabilities.bars.weights).toContain(20);
      expect(capabilities.plates.available).toBe(true);
      expect(capabilities.plates.weights).toEqual([10, 15, 20]);
      expect(capabilities.plates.miniweights).toEqual([0.5, 1.25]);
      expect(capabilities.dumbbells.available).toBe(false);
      expect(capabilities.machines.available).toBe(false);

      vi.restoreAllMocks();
    });

    it('should handle machines-only gym setup', async () => {
      const mockGymId = 'gym-2';
      
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'user_gyms') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({ 
                    data: { gym_id: mockGymId, is_default: true } 
                  })
                })
              })
            })
          };
        }
        return { select: () => ({ eq: () => ({ eq: () => ({}) }) }) };
      });

      vi.spyOn(Promise, 'all').mockImplementation(() => {
        return Promise.resolve([
          { data: [] }, // dumbbells
          { data: [] }, // plates
          { data: [] }, // bars
          { data: [{ 
            equipment_id: 'machine-1', 
            stack_values: [10, 20, 30, 40, 50], 
            aux_increment: 5 
          }] }, // machines
          { data: [] } // miniweights
        ]);
      });

      const capabilities = await getEquipmentCapabilities(mockUserId);

      expect(capabilities.bars.available).toBe(false);
      expect(capabilities.plates.available).toBe(false);
      expect(capabilities.dumbbells.available).toBe(false);
      expect(capabilities.machines.available).toBe(true);
      expect(capabilities.machines.stacks['machine-1'].stackWeights).toEqual([10, 20, 30, 40, 50]);

      vi.restoreAllMocks();
    });

    it('should handle mixed equipment gym setup', async () => {
      const mockGymId = 'gym-3';
      
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'user_gyms') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({ 
                    data: { gym_id: mockGymId, is_default: true } 
                  })
                })
              })
            })
          };
        }
        return { select: () => ({ eq: () => ({ eq: () => ({}) }) }) };
      });

      vi.spyOn(Promise, 'all').mockImplementation(() => {
        return Promise.resolve([
          { data: [{ weight: 10 }, { weight: 15 }, { weight: 20 }] }, // dumbbells
          { data: [{ weight: 20 }, { weight: 15 }] }, // plates
          { data: [{ bar_type_id: '1', bar_types: { default_weight: 20 } }] }, // bars
          { data: [{ equipment_id: 'machine-1', stack_values: [25, 50], aux_increment: 2.5 }] }, // machines
          { data: [{ weight: 1.25 }] } // miniweights
        ]);
      });

      const capabilities = await getEquipmentCapabilities(mockUserId);

      expect(capabilities.bars.available).toBe(true);
      expect(capabilities.plates.available).toBe(true);
      expect(capabilities.dumbbells.available).toBe(true);
      expect(capabilities.dumbbells.weights).toEqual([10, 15, 20]);
      expect(capabilities.dumbbells.increment).toBe(2.5);
      expect(capabilities.machines.available).toBe(true);

      vi.restoreAllMocks();
    });
  });

  describe('hasEquipment', () => {
    const mockCapabilities = {
      bars: { available: true, weights: [20], defaultWeight: 20 },
      plates: { available: false, weights: [], miniweights: [] },
      dumbbells: { available: true, weights: [10, 15, 20], increment: 2.5 },
      machines: { available: false, stacks: {} },
      cables: { available: true, increment: 5 }
    };

    it('should correctly identify available equipment', () => {
      expect(hasEquipment(mockCapabilities, 'barbell')).toBe(true);
      expect(hasEquipment(mockCapabilities, 'bar')).toBe(true);
      expect(hasEquipment(mockCapabilities, 'dumbbell')).toBe(true);
      expect(hasEquipment(mockCapabilities, 'dumbbells')).toBe(true);
      expect(hasEquipment(mockCapabilities, 'machine')).toBe(false);
      expect(hasEquipment(mockCapabilities, 'cables')).toBe(true);
    });

    it('should return false for unknown equipment types', () => {
      expect(hasEquipment(mockCapabilities, 'unknown')).toBe(false);
      expect(hasEquipment(mockCapabilities, '')).toBe(false);
    });
  });

  describe('getAvailableWeights', () => {
    const mockCapabilities = {
      bars: { available: true, weights: [15, 20, 25], defaultWeight: 20 },
      plates: { available: true, weights: [2.5, 5, 10, 20], miniweights: [0.5, 1.25] },
      dumbbells: { available: true, weights: [5, 10, 15, 20, 25], increment: 2.5 },
      machines: { available: false, stacks: {} },
      cables: { available: false, increment: 5 }
    };

    it('should return correct weights for each equipment type', () => {
      expect(getAvailableWeights(mockCapabilities, 'barbell')).toEqual([15, 20, 25]);
      expect(getAvailableWeights(mockCapabilities, 'bar')).toEqual([15, 20, 25]);
      expect(getAvailableWeights(mockCapabilities, 'dumbbell')).toEqual([5, 10, 15, 20, 25]);
      expect(getAvailableWeights(mockCapabilities, 'dumbbells')).toEqual([5, 10, 15, 20, 25]);
      expect(getAvailableWeights(mockCapabilities, 'plates')).toEqual([2.5, 5, 10, 20]);
    });

    it('should return empty array for unsupported equipment types', () => {
      expect(getAvailableWeights(mockCapabilities, 'machine')).toEqual([]);
      expect(getAvailableWeights(mockCapabilities, 'unknown')).toEqual([]);
    });
  });
});