import DOMPurify from 'dompurify';

// Input validation and sanitization utilities
export const security = {
  // Sanitize HTML content to prevent XSS
  sanitizeHtml: (input: string): string => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  },

  // Validate and sanitize text input
  sanitizeText: (input: string, maxLength: number = 1000): string => {
    if (typeof input !== 'string') return '';
    
    // Remove null bytes and control characters
    const cleaned = input
      .replace(/\0/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim();
    
    // Truncate to max length
    return cleaned.slice(0, maxLength);
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Validate UUID format
  isValidUuid: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Validate numeric input
  sanitizeNumber: (input: any, min?: number, max?: number): number | null => {
    const num = parseFloat(input);
    if (isNaN(num)) return null;
    
    if (min !== undefined && num < min) return min;
    if (max !== undefined && num > max) return max;
    
    return num;
  },

  // Validate and sanitize JSON input
  sanitizeJson: (input: any): any => {
    try {
      // If it's already an object, validate it
      if (typeof input === 'object' && input !== null) {
        return JSON.parse(JSON.stringify(input));
      }
      
      // If it's a string, parse it
      if (typeof input === 'string') {
        return JSON.parse(input);
      }
      
      return null;
    } catch {
      return null;
    }
  },

  // Rate limiting helper
  createRateLimiter: (maxRequests: number, windowMs: number) => {
    const requests = new Map<string, number[]>();
    
    return (identifier: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Get existing requests for this identifier
      const userRequests = requests.get(identifier) || [];
      
      // Filter out old requests
      const recentRequests = userRequests.filter(time => time > windowStart);
      
      // Check if limit exceeded
      if (recentRequests.length >= maxRequests) {
        return false;
      }
      
      // Add current request
      recentRequests.push(now);
      requests.set(identifier, recentRequests);
      
      // Clean up old entries periodically
      if (Math.random() < 0.01) { // 1% chance
        for (const [key, times] of requests.entries()) {
          const filtered = times.filter(time => time > windowStart);
          if (filtered.length === 0) {
            requests.delete(key);
          } else {
            requests.set(key, filtered);
          }
        }
      }
      
      return true;
    };
  },

  // Content Security Policy helpers
  getNonce: (): string => {
    return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  },

  // Secure headers for fetch requests
  getSecureHeaders: (): HeadersInit => {
    return {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }
};

// Input validation schemas
export const validationSchemas = {
  workout: {
    title: (value: string) => security.sanitizeText(value, 100),
    notes: (value: string) => security.sanitizeHtml(value).slice(0, 1000),
    weight: (value: any) => security.sanitizeNumber(value, 0, 1000),
    reps: (value: any) => security.sanitizeNumber(value, 1, 999),
    duration: (value: any) => security.sanitizeNumber(value, 1, 86400) // max 24 hours
  },
  
  profile: {
    displayName: (value: string) => security.sanitizeText(value, 50),
    bio: (value: string) => security.sanitizeHtml(value).slice(0, 500),
    username: (value: string) => {
      const sanitized = security.sanitizeText(value, 30);
      // Only allow alphanumeric, underscore, hyphen
      return sanitized.replace(/[^a-zA-Z0-9_-]/g, '');
    }
  }
};