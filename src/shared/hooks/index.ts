import React from 'react';

// Re-export commonly used hooks with correct names
export { useIsMobile as useMobile } from '../../hooks/use-mobile';
export { useAppTranslation } from '../../hooks/useAppTranslation';

// Generic hooks - add useDisclosure, useDebounce, etc. here
export const useDisclosure = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);
  return { isOpen, open, close, toggle };
};