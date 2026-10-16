'use client';

import { useEffect, useRef } from 'react';
import { RUNNER, spriteCanvas } from '@/lib/pixel';

const SPEED = 70; // CSS px per second
const SIZE = 2; // CSS px per sprite pixel

// The runner walks back and forth along the top edge of its parent while the
// pointer is over the parent, and stands still otherwise (or with reduced motion).
export default function PixelWalker() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    const host = canvas?.parentElement;
    if (!canvas || !ctx || !host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frames = {
      right: [spriteCanvas(RUNNER.runA), spriteCanvas(RUNNER.runB)],
      left: [spriteCanvas(RUNNER.runA, true), spriteCanvas(RUNNER.runB, true)],
    };
    let x = 0;
    let dir: 'right' | 'left' = 'right';
    let t = 0;
    let raf = 0;
    let last = 0;

    const paint = (image: HTMLCanvasElement) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      canvas.style.transform = `translateX(${Math.round(x)}px)`;
    };

    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      t += dt;
      const max = host.clientWidth - canvas.width * SIZE;
      x += (dir === 'right' ? 1 : -1) * SPEED * dt;
      if (x >= max) {
        x = max;
        dir = 'left';
      } else if (x <= 0) {
        x = 0;
        dir = 'right';
      }
      paint(frames[dir][Math.floor(t * 8) % 2]);
      raf = requestAnimationFrame(tick);
    };

    const enter = () => {
      if (reduced || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const leave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      paint(frames[dir][1]);
    };

    paint(frames.right[1]);
    host.addEventListener('pointerenter', enter);
    host.addEventListener('pointerleave', leave);
    return () => {
      leave();
      host.removeEventListener('pointerenter', enter);
      host.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      width={RUNNER.runA[0].length}
      height={RUNNER.runA.length}
      className="hv-walker"
      aria-hidden="true"
      style={{ width: RUNNER.runA[0].length * SIZE, height: RUNNER.runA.length * SIZE }}
    />
  );
}
