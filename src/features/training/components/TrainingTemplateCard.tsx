// src/features/training/components/TrainingTemplateCard.tsx
import * as React from 'react';
import { TemplateRow } from '../hooks/useTemplates';

interface Props {
  template: TemplateRow;
  onStart: (id: string) => void;
}

export const TrainingTemplateCard: React.FC<Props> = ({ template, onStart }) => {
  return (
    <div
      className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3"
      data-testid={`template-${template.id}`}
    >
      <div className="text-base font-semibold">{template.name || 'Untitled Template'}</div>
      {template.notes ? (
        <div className="text-sm text-white/70">{template.notes}</div>
      ) : null}

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-white/50">
          {template.is_public ? 'Public' : 'Private'}
        </div>
        <button
          className="rounded-lg bg-emerald-500/90 hover:bg-emerald-500 px-3 py-1.5 text-sm font-medium"
          onClick={() => onStart(template.id)}
        >
          Start
        </button>
      </div>
    </div>
  );
};