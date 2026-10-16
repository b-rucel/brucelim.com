'use client';

import { useEffect, useRef } from 'react';
import { FLAG, RUNNER, RUNNER_IDLE, spriteCanvas } from '@/lib/pixel';

const SCROLL_HOLD_MS = 160;
const END = 0.985;

// Reading progress runner for blog posts: walks along a 2px line fixed just
// below the blog nav, idles when the page is still and plants a flag at the
// end. Decorative: aria-hidden, pointer-events: none, never covers the nav.
export default function ReadingRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const trail = trailRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !trail) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frames = {
      runA: spriteCanvas(RUNNER.runA),
      runB: spriteCanvas(RUNNER.runB),
      idle: spriteCanvas(RUNNER_IDLE),
      flag: spriteCanvas(FLAG),
    };

    let x = 0;
    let lastScroll = -Infinity;
    let raf = 0;
    let last = 0;
    let hidden = document.hidden;

    const progress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return 0;
      return Math.max(0, Math.min(1, window.scrollY / max));
    };

    const maxX = () => Math.max(0, window.innerWidth - canvas.clientWidth);

    const paint = (image: HTMLCanvasElement) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const planted = image === frames.flag;
      ctx.drawImage(image, planted ? 1 : 0, planted ? canvas.height - image.height : 0);
      canvas.style.transform = `translateX(${Math.round(x)}px)`;
    };

    const updateTrail = () => {
      const limit = maxX();
      trail.style.transform = `scaleX(${limit > 0 ? Math.min(1, x / limit) : progress()})`;
    };

    const frame = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      const target = progress() * maxX();
      x += (target - x) * (reduced ? 1 : Math.min(1, dt * 14));
      if (Math.abs(target - x) < 0.5) x = target;
      const done = progress() >= END;
      const scrolling = now - lastScroll < SCROLL_HOLD_MS;
      const image = done
        ? frames.flag
        : scrolling && !reduced
          ? Math.floor(now / 90) % 2 === 0
            ? frames.runA
            : frames.runB
          : frames.idle;
      paint(image);
      updateTrail();
      if (scrolling || Math.abs(target - x) > 0.5) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
      }
    };

    const start = () => {
      if (raf || hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      lastScroll = performance.now();
      start();
    };

    const onResize = () => {
      x = progress() * maxX();
      paint(progress() >= END ? frames.flag : frames.idle);
      updateTrail();
    };

    const onVisibility = () => {
      hidden = document.hidden;
      if (hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else {
        start();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    x = progress() * maxX();
    paint(progress() >= END ? frames.flag : frames.idle);
    updateTrail();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="hv-read-runner" aria-hidden="true">
      <div ref={trailRef} className="hv-read-trail" />
      <canvas
        ref={canvasRef}
        width={RUNNER.runA[0].length}
        height={RUNNER.runA.length}
        className="hv-read-canvas"
      />
    </div>
  );
}
