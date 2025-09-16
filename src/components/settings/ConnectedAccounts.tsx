import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LinkAppleButton } from '@/components/auth/LinkAppleButton';
import { User } from '@supabase/supabase-js';

interface ConnectedAccountsProps {
  user: User;
}

interface UserIdentity {
  provider: string;
  id: string;
  identity_data: any;
  created_at: string;
  updated_at: string;
}

export const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({ user }) => {
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIdentities = async () => {
    try {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser?.identities) {
        setIdentities(currentUser.identities as UserIdentity[]);
      }
    } catch (error) {
      console.error('Error loading identities:', error);
      toast.error('Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdentities();
  }, []);

  const handleUnlinkIdentity = async (identityId: string, provider: string) => {
    try {
      if (identities.length <= 1) {
        toast.error('Cannot unlink your only login method');
        return;
      }

      // Note: Unlinking functionality requires Supabase Pro plan
      toast.info('Account unlinking requires Supabase Pro plan');
    } catch (error) {
      console.error('Error unlinking identity:', error);
      toast.error(`Failed to unlink ${provider} account`);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'apple':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        );
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case 'email':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
    }
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'apple': return 'Apple';
      case 'google': return 'Google';
      case 'facebook': return 'Facebook';
      case 'twitter': return 'Twitter';
      case 'email': return 'Email';
      default: return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  const hasAppleLinked = identities.some(identity => identity.provider === 'apple');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Loading your connected accounts...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Manage your connected social accounts and login methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show current identities */}
        <div className="space-y-3">
          {identities.map((identity) => (
            <div key={identity.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getProviderIcon(identity.provider)}
                <div>
                  <div className="font-medium">
                    {getProviderDisplayName(identity.provider)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {identity.identity_data?.email || 'Connected'}
                  </div>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
              {identities.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnlinkIdentity(identity.id, identity.provider)}
                >
                  Unlink
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Show option to link Apple if not already linked */}
        {!hasAppleLinked && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Link Additional Accounts</h4>
            <div className="flex items-center justify-between p-3 border rounded-lg border-dashed">
              <div className="flex items-center gap-3">
                {getProviderIcon('apple')}
                <div>
                  <div className="font-medium">Apple</div>
                  <div className="text-sm text-muted-foreground">
                    Link your Apple ID for faster sign-in
                  </div>
                </div>
              </div>
              <LinkAppleButton onSuccess={loadIdentities} />
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Account Linking:</strong> When you sign in with Apple and choose "Share My Email", 
          accounts with matching emails are automatically linked. For Apple's "Hide My Email" feature, 
          use the manual linking option above.
        </div>
      </CardContent>
    </Card>
  );
};