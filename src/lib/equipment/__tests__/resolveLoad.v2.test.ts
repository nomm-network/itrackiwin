import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveAchievableLoad } from '../resolveLoad';
import * as featureFlags from '../featureFlags';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

vi.mock('../featureFlags', () => ({
  getFeatureFlag: vi.fn(),
  logWeightResolution: vi.fn()
}));

describe('resolveLoad V2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve barbell weight with kg plates only', async () => {
    // Mock v2 enabled
    vi.mocked(featureFlags.getFeatureFlag).mockResolvedValue(true);
    
    // Mock gym inventory - kg plates only
    const mockSupabase = await import('@/integrations/supabase/client');
    vi.mocked(mockSupabase.supabase.from).mockImplementation((table) => {
      if (table === 'user_gym_plates') {
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: [
                { weight: 25, native_unit: 'kg' },
                { weight: 20, native_unit: 'kg' },
                { weight: 10, native_unit: 'kg' },
                { weight: 5, native_unit: 'kg' },
                { weight: 2.5, native_unit: 'kg' }
              ]
            })
          })
        } as any;
      }
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [] })
        })
      } as any;
    });

    // Mock exercise data
    vi.mocked(mockSupabase.supabase.from).mockImplementation((table) => {
      if (table === 'exercises') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { load_type: 'dual_load', default_bar_type_id: null }
              })
            })
          })
        } as any;
      }
      return { select: () => ({ eq: () => Promise.resolve({ data: [] }) }) } as any;
    });

    const result = await resolveAchievableLoad('exercise-id', 100, 'gym-id');
    
    expect(result.implement).toBe('barbell');
    expect(result.totalKg).toBeCloseTo(100, 0.1);
    expect(result.source).toBe('gym');
    expect(result.achievable).toBe(true);
  });

  it('should resolve dumbbell weight from available pairs', async () => {
    vi.mocked(featureFlags.getFeatureFlag).mockResolvedValue(true);
    
    const mockSupabase = await import('@/integrations/supabase/client');
    vi.mocked(mockSupabase.supabase.from).mockImplementation((table) => {
      if (table === 'user_gym_dumbbells') {
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: [
                { weight: 10, native_unit: 'kg' },
                { weight: 15, native_unit: 'kg' },
                { weight: 20, native_unit: 'kg' },
                { weight: 25, native_unit: 'kg' }
              ]
            })
          })
        } as any;
      }
      if (table === 'exercises') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { load_type: 'single_load', default_bar_type_id: null }
              })
            })
          })
        } as any;
      }
      return { select: () => ({ eq: () => Promise.resolve({ data: [] }) }) } as any;
    });

    const result = await resolveAchievableLoad('exercise-id', 18, 'gym-id');
    
    expect(result.implement).toBe('dumbbell');
    expect(result.totalKg).toBe(20); // Closest available
    expect(result.source).toBe('gym');
    expect(result.residualKg).toBe(-2); // 18 desired, 20 achieved
  });

  it('should resolve stack machine with aux weights', async () => {
    vi.mocked(featureFlags.getFeatureFlag).mockResolvedValue(true);
    
    const mockSupabase = await import('@/integrations/supabase/client');
    vi.mocked(mockSupabase.supabase.from).mockImplementation((table) => {
      if (table === 'exercises') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { load_type: 'stack', default_bar_type_id: null }
              })
            })
          })
        } as any;
      }
      return { select: () => ({ eq: () => Promise.resolve({ data: [] }) }) } as any;
    });

    const result = await resolveAchievableLoad('exercise-id', 47.5, 'gym-id');
    
    expect(result.implement).toBe('machine');
    expect(result.totalKg).toBe(47.5); // 45kg stack + 2.5kg aux
    expect(result.source).toBe('default');
  });

  it('should use mixed unit inventory correctly', async () => {
    vi.mocked(featureFlags.getFeatureFlag).mockResolvedValue(true);
    
    const mockSupabase = await import('@/integrations/supabase/client');
    vi.mocked(mockSupabase.supabase.from).mockImplementation((table) => {
      if (table === 'user_gym_plates') {
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: [
                { weight: 45, native_unit: 'lb' }, // ~20.4kg
                { weight: 25, native_unit: 'lb' }, // ~11.3kg
                { weight: 10, native_unit: 'kg' },
                { weight: 5, native_unit: 'kg' }
              ]
            })
          })
        } as any;
      }
      if (table === 'exercises') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { load_type: 'dual_load', default_bar_type_id: null }
              })
            })
          })
        } as any;
      }
      return { select: () => ({ eq: () => Promise.resolve({ data: [] }) }) } as any;
    });

    const result = await resolveAchievableLoad('exercise-id', 80, 'gym-id');
    
    expect(result.implement).toBe('barbell');
    expect(result.source).toBe('gym');
    expect(result.achievable).toBe(true);
    // Should use mixed plates to get close to 80kg
  });
});