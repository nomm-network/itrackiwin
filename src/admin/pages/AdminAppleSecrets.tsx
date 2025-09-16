import React, { useState, useEffect } from "react";
import PageNav from "@/components/PageNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Key, Shield, Upload, X, Calendar, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminAppleSecrets: React.FC = () => {
  const [formData, setFormData] = useState({
    teamId: 'P57CS74KT4',
    clientId: 'com.itrackiwin.web',
    keyId: '45Y8P8ASJG',
    privateKey: ''
  });
  const [generatedSecret, setGeneratedSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [keyInfo, setKeyInfo] = useState<{
    lastGenerated: string | null;
    expirationDate: string | null;
    daysUntilExpiry: number | null;
  }>({ lastGenerated: null, expirationDate: null, daysUntilExpiry: null });

  useEffect(() => {
    loadKeyInfo();
  }, []);

  const loadKeyInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('system_info')
        .select('value')
        .eq('key', 'apple_siwa_key_info')
        .single();

      if (error) {
        console.error('Error loading key info:', error);
        return;
      }

      const info = data?.value as any;
      if (info?.last_generated_at) {
        const lastGenerated = new Date(info.last_generated_at);
        const expirationDate = new Date(lastGenerated.getTime() + (179 * 24 * 60 * 60 * 1000));
        const daysUntilExpiry = Math.ceil((expirationDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

        setKeyInfo({
          lastGenerated: lastGenerated.toLocaleDateString(),
          expirationDate: expirationDate.toLocaleDateString(),
          daysUntilExpiry
        });
      }
    } catch (error) {
      console.error('Error loading key info:', error);
    }
  };

  const updateKeyInfo = async () => {
    try {
      await supabase
        .from('system_info')
        .update({
          value: {
            last_generated_at: new Date().toISOString(),
            expiration_days: 179
          }
        })
        .eq('key', 'apple_siwa_key_info');

      // Trigger the expiration check function
      await supabase.rpc('check_apple_key_expiration');

      // Reload key info
      await loadKeyInfo();
    } catch (error) {
      console.error('Error updating key info:', error);
    }
  };

  const generateSecret = async () => {
    if (!formData.privateKey.trim()) {
      toast.error('Please upload a .p8 file or paste the private key content');
      return;
    }

    // Validate private key format
    const privateKeyTrimmed = formData.privateKey.trim();
    if (!privateKeyTrimmed.includes('-----BEGIN PRIVATE KEY-----') || 
        !privateKeyTrimmed.includes('-----END PRIVATE KEY-----')) {
      toast.error('Invalid private key format. Please paste the complete .p8 file content including BEGIN/END lines.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create JWT using Web Crypto API (browser-compatible)
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: formData.teamId,
        iat: now,
        exp: now + 60 * 60 * 24 * 179, // 179 days expiration
        aud: 'https://appleid.apple.com',
        sub: formData.clientId,
      };

      // Create JWT header
      const header = {
        alg: 'ES256',
        kid: formData.keyId,
        typ: 'JWT'
      };

      // Base64URL encode header and payload
      const base64UrlEncode = (obj: any) => {
        return btoa(JSON.stringify(obj))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      };

      const encodedHeader = base64UrlEncode(header);
      const encodedPayload = base64UrlEncode(payload);
      const message = `${encodedHeader}.${encodedPayload}`;

      // Import the private key
      const pemHeader = "-----BEGIN PRIVATE KEY-----";
      const pemFooter = "-----END PRIVATE KEY-----";
      const pemContents = privateKeyTrimmed
        .replace(pemHeader, '')
        .replace(pemFooter, '')
        .replace(/\s/g, '');
      
      const binaryDer = atob(pemContents);
      const keyData = new Uint8Array(binaryDer.length);
      for (let i = 0; i < binaryDer.length; i++) {
        keyData[i] = binaryDer.charCodeAt(i);
      }

      // Import the key for signing
      const cryptoKey = await window.crypto.subtle.importKey(
        'pkcs8',
        keyData,
        {
          name: 'ECDSA',
          namedCurve: 'P-256'
        },
        false,
        ['sign']
      );

      // Sign the message
      const signature = await window.crypto.subtle.sign(
        {
          name: 'ECDSA',
          hash: 'SHA-256'
        },
        cryptoKey,
        new TextEncoder().encode(message)
      );

      // Convert signature to base64url
      const signatureArray = new Uint8Array(signature);
      const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const jwt = `${message}.${signatureBase64}`;
      setGeneratedSecret(jwt);
      await updateKeyInfo(); // Update the database with generation timestamp
      toast.success('Apple client secret generated successfully!');
    } catch (error: any) {
      console.error('Error generating secret:', error);
      
      let errorMessage = 'Failed to generate secret. ';
      if (error.message?.includes('invalid key') || error.message?.includes('key format')) {
        errorMessage += 'Invalid private key format. Make sure it\'s a valid P-256 ECDSA key.';
      } else if (error.message?.includes('importKey')) {
        errorMessage += 'Could not import the private key. Verify the .p8 file format.';
      } else if (error.message?.includes('sign')) {
        errorMessage += 'Signing failed. Check if the key supports ES256 algorithm.';
      } else {
        errorMessage += `Crypto error: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file extension
    if (!file.name.endsWith('.p8')) {
      toast.error('Please select a .p8 file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFormData(prev => ({ ...prev, privateKey: content }));
      setUploadedFileName(file.name);
      toast.success('Private key file uploaded successfully!');
    };
    
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    
    reader.readAsText(file);
    
    // Clear the input so the same file can be uploaded again
    event.target.value = '';
  };

  const clearUploadedFile = () => {
    setFormData(prev => ({ ...prev, privateKey: '' }));
    setUploadedFileName('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSecret);
    toast.success('Secret copied to clipboard!');
  };

  return (
    <main className="container py-6">
      <PageNav current="Admin / Apple Secrets" />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Apple Client Secret Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate JWT tokens for Apple Sign In authentication
          </p>
        </div>

        {/* Key Status Information */}
        {keyInfo.lastGenerated && (
          <Card className={`${keyInfo.daysUntilExpiry !== null && keyInfo.daysUntilExpiry <= 30 ? 'border-orange-500' : keyInfo.daysUntilExpiry !== null && keyInfo.daysUntilExpiry <= 0 ? 'border-red-500' : 'border-green-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Current Apple SIWA Key Status
                {keyInfo.daysUntilExpiry !== null && keyInfo.daysUntilExpiry <= 30 && (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                )}
                {keyInfo.daysUntilExpiry !== null && keyInfo.daysUntilExpiry <= 0 && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Last Generated</Label>
                  <p className="text-sm text-muted-foreground">{keyInfo.lastGenerated}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Expiration Date</Label>
                  <p className="text-sm text-muted-foreground">{keyInfo.expirationDate}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Days Until Expiry</Label>
                  <p className={`text-sm font-medium ${keyInfo.daysUntilExpiry !== null && keyInfo.daysUntilExpiry <= 0 ? 'text-red-600' : keyInfo.daysUntilExpiry !== null && keyInfo.daysUntilExpiry <= 30 ? 'text-orange-600' : 'text-green-600'}`}>
                    {keyInfo.daysUntilExpiry !== null && keyInfo.daysUntilExpiry <= 0 
                      ? `Expired ${Math.abs(keyInfo.daysUntilExpiry)} days ago`
                      : `${keyInfo.daysUntilExpiry} days`
                    }
                  </p>
                </div>
              </div>
              {keyInfo.daysUntilExpiry !== null && keyInfo.daysUntilExpiry <= 30 && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {keyInfo.daysUntilExpiry <= 0 
                      ? "Your Apple SIWA key has expired! Apple authentication will not work until you regenerate the key."
                      : `Your Apple SIWA key will expire in ${keyInfo.daysUntilExpiry} days. Please regenerate it before expiration.`
                    }
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Apple Developer Credentials
            </CardTitle>
            <CardDescription>
              Enter your Apple Developer account information to generate a client secret JWT
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamId">Team ID</Label>
                <Input
                  id="teamId"
                  value={formData.teamId}
                  onChange={(e) => setFormData({...formData, teamId: e.target.value})}
                  placeholder="P57CS74KT4"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID (Services ID)</Label>
                <Input
                  id="clientId"
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  placeholder="com.itrackiwin.web"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keyId">Key ID</Label>
                <Input
                  id="keyId"
                  value={formData.keyId}
                  onChange={(e) => setFormData({...formData, keyId: e.target.value})}
                  placeholder="45Y8P8ASJG"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Private Key (.p8 file)</Label>
              
              {/* File Upload Option */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <div className="mt-4">
                    <Label 
                      htmlFor="p8-file-upload" 
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
                    >
                      Upload .p8 File
                    </Label>
                    <input
                      id="p8-file-upload"
                      type="file"
                      accept=".p8"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload your AuthKey_XXXXXXXXXX.p8 file directly
                  </p>
                  
                  {uploadedFileName && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600">
                      <Key className="h-4 w-4" />
                      <span>{uploadedFileName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearUploadedFile}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or paste content</span>
                </div>
              </div>

              {/* Manual Paste Option */}
              <div className="space-y-2">
                <Label htmlFor="privateKey">Paste .p8 file content manually</Label>
                <Textarea
                  id="privateKey"
                  rows={6}
                  value={formData.privateKey}
                  onChange={(e) => setFormData({...formData, privateKey: e.target.value})}
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkw...&#10;-----END PRIVATE KEY-----"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            
            <Button 
              onClick={generateSecret} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Generating...' : 'Generate Client Secret JWT'}
            </Button>
          </CardContent>
        </Card>

        {generatedSecret && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Generated Client Secret
              </CardTitle>
              <CardDescription>
                Copy this JWT token and paste it into Supabase → Auth → Providers → Apple → Secret Key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  value={generatedSecret}
                  readOnly
                  rows={4}
                  className="font-mono text-sm pr-12"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <Alert>
                <AlertDescription>
                  <strong>Important:</strong> This token expires in 179 days. Make sure to regenerate it before expiration. 
                  Apple requires client secrets to be refreshed regularly for security.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Get your Team ID from the top-right of your Apple Developer portal</p>
            <p>2. Use your Services ID (e.g., com.itrackiwin.web) as the Client ID</p>
            <p>3. Find your Key ID in Apple Developer → Keys section</p>
            <p>4. Upload your .p8 private key file OR copy its entire content (including BEGIN/END lines)</p>
            <p>5. Generate the JWT and copy it to Supabase Auth settings</p>
            <p>6. Remember to regenerate the token every 179 days</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default AdminAppleSecrets;