import { supabase } from '@/integrations/supabase/client';
import type {
  FitnessProfile,
  UpdateFitnessProfile,
  WorkoutTemplate,
  GenerateTemplateRequest,
  ExerciseAlternative,
  SuggestAlternativesRequest,
  EquipmentCapability,
  RecalibrationTrigger,
  ApiResponse,
  PaginatedResponse
} from './types';

/**
 * Unified API client for fitness application
 * Provides type-safe access to all backend endpoints
 */
export class FitnessApiClient {
  private baseUrl: string;
  private getAuthHeaders: () => Promise<{ Authorization: string }>;

  constructor() {
    this.baseUrl = 'https://fsayiuhncisevhipbrak.supabase.co/functions/v1';
    this.getAuthHeaders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }
      return { Authorization: `Bearer ${session.access_token}` };
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }

  // Fitness Profile API
  async getFitnessProfile(): Promise<ApiResponse<FitnessProfile | null>> {
    return this.request<FitnessProfile | null>('/fitness-profile');
  }

  async updateFitnessProfile(profile: UpdateFitnessProfile): Promise<ApiResponse<FitnessProfile>> {
    return this.request<FitnessProfile>('/fitness-profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // Workout Templates API
  async getWorkoutTemplates(options?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<WorkoutTemplate>> {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', options.page.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/workout-templates${queryString ? `?${queryString}` : ''}`;
    
    return this.request<WorkoutTemplate[]>(endpoint) as Promise<PaginatedResponse<WorkoutTemplate>>;
  }

  async getWorkoutTemplate(templateId: string): Promise<ApiResponse<WorkoutTemplate>> {
    return this.request<WorkoutTemplate>(`/workout-templates/${templateId}`);
  }

  async generateWorkoutTemplate(request: GenerateTemplateRequest): Promise<ApiResponse<WorkoutTemplate>> {
    return this.request<WorkoutTemplate>('/workout-templates', {
      method: 'POST',
      body: JSON.stringify({ ...request, generate: true }),
    });
  }

  async createWorkoutTemplate(template: Omit<WorkoutTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<WorkoutTemplate>> {
    return this.request<WorkoutTemplate>('/workout-templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  // Exercise Alternatives API
  async suggestExerciseAlternatives(request: Omit<SuggestAlternativesRequest, 'user_id'>): Promise<ApiResponse<ExerciseAlternative[]>> {
    return this.request<ExerciseAlternative[]>('/exercise-alternatives', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Equipment Capabilities API
  async getEquipmentCapabilities(options?: {
    equipment_id?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<EquipmentCapability> | PaginatedResponse<EquipmentCapability>> {
    const params = new URLSearchParams();
    if (options?.equipment_id) params.set('equipment_id', options.equipment_id);
    if (options?.page) params.set('page', options.page.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/equipment-capabilities${queryString ? `?${queryString}` : ''}`;
    
    if (options?.equipment_id) {
      return this.request<EquipmentCapability>(endpoint) as Promise<ApiResponse<EquipmentCapability>>;
    } else {
      return this.request<EquipmentCapability[]>(endpoint) as Promise<PaginatedResponse<EquipmentCapability>>;
    }
  }

  // Admin Recalibration API
  async triggerRecalibration(request: RecalibrationTrigger): Promise<ApiResponse<any>> {
    return this.request<any>('/recalibrate-trigger', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Utility methods for common patterns
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    fallback?: T
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error('API operation failed:', error);
      if (fallback !== undefined) {
        return fallback;
      }
      throw error;
    }
  }

  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError!;
  }
}

// Export singleton instance
export const fitnessApi = new FitnessApiClient();

// Export for dependency injection
export default FitnessApiClient;