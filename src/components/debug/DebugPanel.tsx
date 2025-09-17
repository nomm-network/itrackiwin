import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Bug, AlertTriangle, Info, X } from 'lucide-react';

interface DebugLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  details?: any;
  source?: string;
}

interface DebugPanelProps {
  className?: string;
  forceOpen?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ className = '', forceOpen = false }) => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isOpen, setIsOpen] = useState(forceOpen);
  
  // Keep panel open if forceOpen is true
  React.useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addLog({
        level: 'error',
        message: event.message,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        },
        source: 'JavaScript Error'
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addLog({
        level: 'error',
        message: 'Unhandled Promise Rejection',
        details: event.reason,
        source: 'Promise Rejection'
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Custom logging function that can be used throughout the app
  const addLog = (log: Omit<DebugLog, 'id' | 'timestamp'>) => {
    const newLog: DebugLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep only last 100 logs
    
    // Auto-open on errors
    if (log.level === 'error') {
      setIsOpen(true);
    }
  };

  // Expose logging function globally for easy access
  useEffect(() => {
    (window as any).debugLog = addLog;
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const getIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info': return <Info className="h-4 w-4 text-info" />;
      default: return <Bug className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);
  const errorCount = logs.filter(log => log.level === 'error').length;
  const warnCount = logs.filter(log => log.level === 'warn').length;

  // Always show the panel if forced open, even without logs
  if (!forceOpen && logs.length === 0 && !isOpen) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${className}`}>
      <Card className="shadow-lg border-2 max-w-full bg-background/95 backdrop-blur">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bug className="h-4 w-4" />
                  Debug Panel
                  {(errorCount > 0 || warnCount > 0) && (
                    <div className="flex gap-1">
                      {errorCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {errorCount} errors
                        </Badge>
                      )}
                      {warnCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {warnCount} warnings
                        </Badge>
                      )}
                    </div>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                  >
                    All ({logs.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'error' ? 'destructive' : 'outline'}
                    onClick={() => setFilter('error')}
                  >
                    Errors ({errorCount})
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'warn' ? 'secondary' : 'outline'}
                    onClick={() => setFilter('warn')}
                  >
                    Warnings ({warnCount})
                  </Button>
                </div>
                <Button size="sm" variant="outline" onClick={clearLogs}>
                  Clear
                </Button>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  {forceOpen && logs.length === 0 ? 'Debug panel ready - waiting for logs...' : `No ${filter === 'all' ? 'logs' : filter + 's'} found`}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <Alert key={log.id} className="text-xs">
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {getIcon(log.level)}
                              <Badge variant={getBadgeVariant(log.level) as any} className="text-xs">
                                {log.level.toUpperCase()}
                              </Badge>
                              {log.source && (
                                <Badge variant="outline" className="text-xs">
                                  {log.source}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <div className="font-mono text-xs break-words">
                            {log.message}
                          </div>
                          
                          {log.details && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                Show details
                              </summary>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {typeof log.details === 'string' 
                                  ? log.details 
                                  : JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

// Export the logging function for use in other components
export const debugLog = (level: 'error' | 'warn' | 'info' | 'debug', message: string, details?: any, source?: string) => {
  if ((window as any).debugLog) {
    (window as any).debugLog({ level, message, details, source });
  } else {
    // Fallback to console if debug panel not initialized
    console[level](message, details);
  }
};

export default DebugPanel;