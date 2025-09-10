import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const REACTIONS = [
  { key: 'like', label: '👍' },
  { key: 'dislike', label: '👎' },
  { key: 'muscle', label: '💪' },
  { key: 'clap', label: '👏' },
  { key: 'ok', label: '👌' },
  { key: 'fire', label: '🔥' },
  { key: 'heart', label: '❤️' },
  { key: 'cheers', label: '🥂' },
  { key: 'thumbsup', label: '👍' },
] as const;

interface EmojiPickerProps {
  onSelect: (reaction: 'like' | 'dislike' | 'muscle' | 'clap' | 'ok' | 'fire' | 'heart' | 'cheers' | 'thumbsup') => void;
  currentReaction?: string | null;
  counts?: Record<string, number>;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, currentReaction, counts = {} }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (reactionKey: 'like' | 'dislike' | 'muscle' | 'clap' | 'ok' | 'fire' | 'heart' | 'cheers' | 'thumbsup') => {
    onSelect(reactionKey);
    setOpen(false);
  };

  const totalReactions = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Existing reaction badges */}
      {Object.entries(counts).map(([reactionKey, count]) => {
        if (count === 0) return null;
        const reaction = REACTIONS.find(r => r.key === reactionKey);
        if (!reaction) return null;
        
        const isUserReaction = currentReaction === reactionKey;
        
        return (
          <Button
            key={reactionKey}
            variant="ghost"
            size="sm"
            onClick={() => handleSelect(reactionKey as 'like' | 'dislike' | 'muscle' | 'clap' | 'ok' | 'fire' | 'heart' | 'cheers' | 'thumbsup')}
            className={`h-7 px-2 rounded-full text-xs font-medium transition-all hover:scale-105 ${
              isUserReaction 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="mr-1">{reaction.label}</span>
            <span>{count}</span>
          </Button>
        );
      })}
      
      {/* Add reaction button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full text-lg hover:scale-110 transition-transform hover:bg-muted"
          >
            💪
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-3 gap-1">
            {REACTIONS.map((reaction) => (
              <Button
                key={reaction.key}
                variant="ghost"
                size="sm"
                onClick={() => handleSelect(reaction.key)}
                className="h-10 w-10 p-0 text-lg hover:scale-110 transition-transform hover:bg-muted"
              >
                {reaction.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};