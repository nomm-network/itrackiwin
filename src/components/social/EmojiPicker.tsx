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
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-sm hover:scale-110 transition-transform"
          >
            {currentReaction ? 
              REACTIONS.find(r => r.key === currentReaction)?.label || '👍' : 
              '👍'
            }
            React
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-3 gap-1">
            {REACTIONS.map((reaction) => (
              <Button
                key={reaction.key}
                variant={currentReaction === reaction.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleSelect(reaction.key)}
                className="h-10 w-10 p-0 text-lg hover:scale-110 transition-transform"
              >
                {reaction.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {totalReactions > 0 && (
        <span className="text-sm text-muted-foreground">
          {totalReactions} reaction{totalReactions !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};