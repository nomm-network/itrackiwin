import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';

interface EdgeFunctionError {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  level: 'error' | 'warn' | 'info';
  details: any;
}

export const EdgeFunctionDebugPanel: React.FC = () => {
  const [errors, setErrors] = useState<EdgeFunctionError[]>([]);

  // Listen for new edge function errors
  useEffect(() => {
    const handleError = (event: CustomEvent) => {
      const error: EdgeFunctionError = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        title: event.detail.title || 'Edge Function Error',
        message: event.detail.message || 'Unknown error',
        level: event.detail.level || 'error',
        details: event.detail.details || {}
      };
      
      setErrors(prev => [error, ...prev.slice(0, 19)]); // Keep last 20 errors
    };

    window.addEventListener('edgeFunctionError', handleError as EventListener);
    
    return () => {
      window.removeEventListener('edgeFunctionError', handleError as EventListener);
    };
  }, []);

  // Auto-capture from global debug logs
  useEffect(() => {
    const originalDebugLog = (window as any).debugLog;
    
    (window as any).debugLog = function(level: string, message: string, details?: any) {
      // Call original debug log
      if (originalDebugLog) {
        originalDebugLog(level, message, details);
      }
      
      // If it's an edge function related error, capture it
      if (level === 'error' && (message.includes('Edge Function') || message.includes('Supabase'))) {
        const error: EdgeFunctionError = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          title: message,
          message: details?.errorMessage || details?.message || 'No detailed message',
          level: 'error',
          details: details || {}
        };
        
        setErrors(prev => [error, ...prev.slice(0, 19)]);
      }
    };

    return () => {
      (window as any).debugLog = originalDebugLog;
    };
  }, []);

  const clearErrors = () => {
    setErrors([]);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="mb-4 border-red-200 bg-red-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            EXACT EDGE FUNCTION ERRORS
            <Badge variant="destructive">{errors.length} errors</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearErrors}>
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {errors.length === 0 ? (
            <div className="text-center py-4 text-red-600">
              <p className="font-semibold">No edge function errors captured yet</p>
              <p className="text-sm text-red-500">Try generating a program to see detailed error information</p>
            </div>
          ) : (
            errors.map((error) => (
              <div
                key={error.id}
                className="p-4 bg-white border border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={getLevelColor(error.level)}>
                    {error.level.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium text-red-700">
                    {error.timestamp}
                  </span>
                </div>
                
                <h4 className="font-semibold text-red-800 mb-2">{error.title}</h4>
                <p className="text-red-700 mb-3">{error.message}</p>
                
                {error.details && Object.keys(error.details).length > 0 && (
                  <details className="cursor-pointer">
                    <summary className="text-sm font-medium text-red-600 mb-2">
                      Full Error Details (click to expand)
                    </summary>
                    <pre className="text-xs bg-red-100 p-3 rounded border overflow-x-auto text-red-800 font-mono">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};