'use client';

import { useEffect, useRef } from 'react';

// Reading progress line for blog posts: a 2px line fixed just below the blog
// nav that fills as the page scrolls. Decorative: aria-hidden,
// pointer-events: none, never covers the nav.
export default function ReadingRunner() {
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trail = trailRef.current;
    if (!trail) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      trail.style.transform = `scaleX(${progress})`;
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <div className="hv-read-runner" aria-hidden="true">
      <div ref={trailRef} className="hv-read-trail" />
    </div>
  );
}
