import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AtlasMessage {
  role: string;
  text: string;
  handoff?: { category_slug: string } | null;
}

export function AtlasChat() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const sendAtlasMessage = async () => {
    if (!message.trim() || !user) return;

    setIsLoading(true);
    try {
      const response = await fetch('https://fsayiuhncisevhipbrak.supabase.co/functions/v1/router-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzYXlpdWhuY2lzZXZoaXBicmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTc1ODAsImV4cCI6MjA3MDI3MzU4MH0.m6Q6-kyLfctBMaoUvuOOaAH2T6GP8T8MRy_ctSzmszw'}`
        },
        body: JSON.stringify({ user_id: user.id, message })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data: AtlasMessage = await response.json();
      
      if (data.handoff?.category_slug) {
        toast.success(`Routing you to ${data.handoff.category_slug} coach...`);
        navigate(`/area/${data.handoff.category_slug}`);
      } else {
        setReplies(prev => [...prev.slice(-1), data.text]); // Keep only last 2 replies
      }
      
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAtlasMessage();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Ask Atlas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {replies.length > 0 && (
          <div className="space-y-2">
            {replies.map((reply, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{reply}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="space-y-2">
          <Textarea
            placeholder="Ask me anything about your life goals..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="min-h-[80px]"
          />
          <Button 
            onClick={sendAtlasMessage}
            disabled={!message.trim() || isLoading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}