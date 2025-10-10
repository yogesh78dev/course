import { useEffect, RefObject } from 'react';

type Event = MouseEvent | TouchEvent;

/**
 * Custom hook for handling clicks outside of a specified element.
 * @param ref - The RefObject for the element to detect outside clicks for.
 * @param handler - The callback function to execute when a click outside is detected.
 */
export const useOutsideClick = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current;
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains((event?.target as Node) || null)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Reload only if ref or handler changes
};
