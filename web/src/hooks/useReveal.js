import { useEffect, useRef, useState } from 'react';

/** Reveals an element once it scrolls into view. Disconnects immediately
 *  after firing so there is no lingering observer work. */
export default function useReveal({ threshold = 0.12, rootMargin = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [shown, threshold, rootMargin]);

  return [ref, shown];
}
