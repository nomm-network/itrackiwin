import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { security } from '@/lib/security';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

interface SecurityContextType {
  sanitizeInput: typeof security.sanitizeText;
  validateEmail: typeof security.isValidEmail;
  validateUuid: typeof security.isValidUuid;
  sanitizeHtml: typeof security.sanitizeHtml;
  logSecurityEvent: (event: { action_type: string; details?: any }) => void;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export function useSecurityContext() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
}

interface SecurityProviderProps {
  children: ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const { logSecurityEvent } = useSecurityMonitoring();

  useEffect(() => {
    // Set up global security measures
    const originalFetch = window.fetch;
    
    // Intercept and add security headers to all fetch requests
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const secureInit: RequestInit = {
        ...init,
        headers: {
          ...security.getSecureHeaders(),
          ...init?.headers
        }
      };
      
      return originalFetch(input, secureInit);
    };

    // Monitor for potential XSS attempts
    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.message) {
        const message = event.error.message.toLowerCase();
        if (message.includes('script') || message.includes('eval') || message.includes('function constructor')) {
          logSecurityEvent({
            action_type: 'potential_xss_detected',
            details: {
              error: event.error.message,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
              timestamp: Date.now()
            }
          });
        }
      }
    };

    // Monitor for suspicious DOM manipulation
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for inline scripts
              if (element.tagName === 'SCRIPT' && element.getAttribute('src') === null) {
                logSecurityEvent({
                  action_type: 'inline_script_detected',
                  details: {
                    content: element.textContent?.substring(0, 100),
                    timestamp: Date.now()
                  }
                });
              }
              
              // Check for suspicious attributes
              const suspiciousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover'];
              suspiciousAttrs.forEach(attr => {
                if (element.hasAttribute(attr)) {
                  logSecurityEvent({
                    action_type: 'suspicious_attribute_detected',
                    details: {
                      attribute: attr,
                      value: element.getAttribute(attr)?.substring(0, 100),
                      timestamp: Date.now()
                    }
                  });
                }
              });
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener('error', handleError);

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener('error', handleError);
      observer.disconnect();
    };
  }, [logSecurityEvent]);

  const contextValue: SecurityContextType = {
    sanitizeInput: security.sanitizeText,
    validateEmail: security.isValidEmail,
    validateUuid: security.isValidUuid,
    sanitizeHtml: security.sanitizeHtml,
    logSecurityEvent
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
}