// Tiny shim so old imports don't crash. Replace later with the real card.
import React from 'react';

export default function ExerciseCard(props: React.PropsWithChildren<{ className?: string }>) {
  return <div className={props.className}>{props.children}</div>;
}