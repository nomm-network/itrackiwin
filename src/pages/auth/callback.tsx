import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL to check for OAuth callback parameters
        const url = window.location.href;
        console.log('Callback URL:', url);
        
        // Check if we have OAuth callback parameters
        const hasAuthParams = url.includes('access_token') || url.includes('code') || url.includes('error');
        
        if (hasAuthParams) {
          console.log('Processing OAuth callback...');
          // Let Supabase process the OAuth callback automatically
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('OAuth callback error:', error);
            setStatus('error');
            setErrorMessage(error.message);
            toast.error('Authentication failed: ' + error.message);
            return;
          }

          if (data.session) {
            console.log('Session established:', data.session.user);
            setStatus('success');
            toast.success('Successfully signed in with Apple!');
            
            // Redirect to dashboard
            const redirectTo = searchParams.get('redirect_to') || '/dashboard';
            setTimeout(() => {
              navigate(redirectTo, { replace: true });
            }, 1000);
            return;
          }
        }
        
        // If no OAuth params or session, check existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setStatus('error');
          setErrorMessage(error.message);
          toast.error('Authentication failed: ' + error.message);
          return;
        }

        if (data.session) {
          // Already authenticated
          setStatus('success');
          const redirectTo = searchParams.get('redirect_to') || '/dashboard';
          navigate(redirectTo, { replace: true });
        } else {
          // No session found
          setStatus('error');
          setErrorMessage('No authentication session found');
          toast.error('Authentication was cancelled or failed');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Unknown authentication error');
        toast.error('Authentication failed');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  const handleRetry = () => {
    navigate('/', { replace: true });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold">Completing sign in...</h2>
          <p className="text-muted-foreground">Please wait while we verify your Apple ID</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-600">Successfully signed in!</h2>
          <p className="text-muted-foreground">Redirecting you to the app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto p-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-red-600">Authentication Failed</h2>
        <p className="text-muted-foreground">{errorMessage}</p>
        <button
          onClick={handleRetry}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default AuthCallback;