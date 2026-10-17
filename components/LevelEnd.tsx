'use client';

import { useEffect, useRef } from 'react';
import { BUSH, FLAG, GRASS, RUNNER_SLEEP, drawPixelText, spriteCanvas } from '@/lib/pixel';

const SCALE = 2;
const WORLD_H = 36;

// End-of-level strip: grass row, bush, flag pole and the runner dozing with a
// floating "Z z". Draws one still frame with reduced motion; pauses off-screen.
export default function LevelEnd() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sprites = {
      grass: spriteCanvas(GRASS),
      bush: spriteCanvas(BUSH),
      flag: spriteCanvas(FLAG),
      sleep: spriteCanvas(RUNNER_SLEEP),
    };

    let width = 200;
    let t = 0;
    let raf = 0;
    let last = 0;
    let visible = true;
    let hidden = document.hidden;

    const paint = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      const base = WORLD_H - 2;
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(0, base - 1, width, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      for (let gx = 2; gx < width; gx += 7) ctx.fillRect(Math.round(gx), base, 3, 1);

      for (let gx = 1; gx < width - 4; gx += 9) ctx.drawImage(sprites.grass, Math.round(gx), base - 3);
      ctx.drawImage(sprites.bush, Math.round(width * 0.58), base - 5);
      ctx.drawImage(sprites.flag, Math.round(width * 0.82), base - 12);

      const sleepX = Math.round(Math.min(24, width * 0.08));
      ctx.drawImage(sprites.sleep, sleepX, base - 8);

      const frame = reduced ? 0 : Math.floor(t * 1.3) % 2;
      drawPixelText(ctx, 'Z', sleepX + 16, 10 + frame * 2, 'rgba(255,255,255,0.85)', 2);
      drawPixelText(ctx, 'Z', sleepX + 26, 17 - frame * 2, 'rgba(255,255,255,0.6)', 1);
    };

    const frameLoop = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      t += dt;
      paint();
      raf = visible && !hidden ? requestAnimationFrame(frameLoop) : 0;
    };

    const start = () => {
      if (raf || !visible || hidden) return;
      if (reduced) {
        paint();
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(frameLoop);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      width = Math.max(120, cssW / SCALE);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(WORLD_H * SCALE * dpr);
      ctx.setTransform(dpr * SCALE, 0, 0, dpr * SCALE, 0, 0);
      ctx.imageSmoothingEnabled = false;
      paint();
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

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) {
        start();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    const resizeObserver = new ResizeObserver(resize);

    document.addEventListener('visibilitychange', onVisibility);
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    resize();
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="hv-levelend" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="hv-levelend-canvas"
        style={{ height: WORLD_H * SCALE }}
      />
    </div>
  );
}
