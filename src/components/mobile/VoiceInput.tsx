import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { parseVoiceInput, formatParsedInput, voiceCommandSuggestions } from '@/lib/voiceParser';

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
  className?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: Event) => void): void;
  addEventListener(type: 'end', listener: (event: Event) => void): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onResult,
  placeholder = "Tap to speak...",
  className
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          const parsed = parseVoiceInput(finalTranscript);
          const formatted = formatParsedInput(parsed);
          console.log('Voice parsed:', parsed, 'formatted:', formatted);
          onResult(finalTranscript.trim());
          setTranscript('');
        }
      });

      recognition.addEventListener('error', (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable microphone permissions.');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else {
          toast.error('Voice recognition error. Please try again.');
        }
      });

      recognition.addEventListener('end', () => {
        setIsListening(false);
        setTranscript('');
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult]);

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    
    try {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setIsListening(false);
      toast.error('Failed to start voice recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <Card className={`opacity-50 ${className}`}>
        <CardContent className="p-4 text-center">
          <MicOff className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Voice input not supported</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Button
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="h-12 w-12 rounded-full"
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? (
              <Square className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
          
          <div className="flex-1">
            {isListening ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="animate-pulse">
                    Listening...
                  </Badge>
                </div>
                {transcript && (
                  <p className="text-sm font-medium">{transcript}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{placeholder}</p>
            )}
          </div>
        </div>
        
        {isListening && (
          <div className="mt-3 space-y-1">
            <div className="text-xs text-muted-foreground">
              Try saying:
            </div>
            <div className="text-xs text-muted-foreground">
              {voiceCommandSuggestions.slice(0, 2).join(' • ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceInput;