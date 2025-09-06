// This component has been replaced by LoadTypeSetInput.tsx
// It provides more comprehensive support for different load types
import { LoadTypeSetInput } from './LoadTypeSetInput';

type Exercise = {
  id: string;
  selected_bar_id?: string | null;
  exercise?: {
    is_bar_loaded?: boolean;
  };
};

type Props = {
  exercise: Exercise;
  setIndex: number;
  onLogged: () => void;
};

export function BarLoadedSetInput({ exercise, setIndex, onLogged }: Props) {
  // Fallback to LoadTypeSetInput for better handling
  return <LoadTypeSetInput exercise={exercise} setIndex={setIndex} onLogged={onLogged} />;
}