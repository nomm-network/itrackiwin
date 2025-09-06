import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { SecurityProvider } from '@/components/security/SecurityProvider';
import { AppRoutes } from '@/app/router/AppRoutes';
import { queryClient } from '@/app/providers/QueryClientProvider';

export default function App() {
  useEffect(() => {
    // Set security headers via meta tags
    const setSecurityHeaders = () => {
      // Content Security Policy
      const csp = document.createElement('meta');
      csp.setAttribute('http-equiv', 'Content-Security-Policy');
      csp.setAttribute('content', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://fsayiuhncisevhipbrak.supabase.co wss://fsayiuhncisevhipbrak.supabase.co; font-src 'self'; frame-ancestors 'none';");
      document.head.appendChild(csp);

      // X-Frame-Options
      const frameOptions = document.createElement('meta');
      frameOptions.setAttribute('http-equiv', 'X-Frame-Options');
      frameOptions.setAttribute('content', 'DENY');
      document.head.appendChild(frameOptions);

      // X-Content-Type-Options
      const contentTypeOptions = document.createElement('meta');
      contentTypeOptions.setAttribute('http-equiv', 'X-Content-Type-Options');
      contentTypeOptions.setAttribute('content', 'nosniff');
      document.head.appendChild(contentTypeOptions);

      // Referrer Policy
      const referrerPolicy = document.createElement('meta');
      referrerPolicy.setAttribute('name', 'referrer');
      referrerPolicy.setAttribute('content', 'strict-origin-when-cross-origin');
      document.head.appendChild(referrerPolicy);
    };

    setSecurityHeaders();

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(() => console.log('SW registered'))
          .catch(() => console.log('SW registration failed'));
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </SecurityProvider>
    </QueryClientProvider>
  );
}


