'use client';

import { useEffect, useRef } from 'react';
import {
  RUNNER_IDLE,
  RUNNER_IDLE_BLINK,
  RUNNER_WAVE,
  RUNNER_WAVE_B,
  spriteCanvas,
} from '@/lib/pixel';

// Tiny runner beside the logo. Blinks every 3-5s; waves while its host link is
// hovered or focused. Decorative: aria-hidden and pointer-events: none.
export default function NavSprite() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    const host = canvas?.parentElement;
    if (!canvas || !ctx || !host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frames = {
      idle: spriteCanvas(RUNNER_IDLE),
      blink: spriteCanvas(RUNNER_IDLE_BLINK),
      waveA: spriteCanvas(RUNNER_WAVE),
      waveB: spriteCanvas(RUNNER_WAVE_B),
    };

    let waving = false;
    let blinking = false;
    let waveFrame = 0;
    let hidden = document.hidden;
    let blinkTimer = 0;
    let blinkOffTimer = 0;
    let waveTimer = 0;

    const draw = (image: HTMLCanvasElement) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
    };

    const paint = () => {
      if (waving) {
        draw(reduced ? frames.waveA : waveFrame % 2 === 0 ? frames.waveA : frames.waveB);
      } else if (blinking) {
        draw(frames.blink);
      } else {
        draw(frames.idle);
      }
    };

    const scheduleBlink = () => {
      window.clearTimeout(blinkTimer);
      if (reduced) return;
      blinkTimer = window.setTimeout(() => {
        if (hidden || waving) {
          scheduleBlink();
          return;
        }
        blinking = true;
        paint();
        blinkOffTimer = window.setTimeout(() => {
          blinking = false;
          paint();
          scheduleBlink();
        }, 180);
      }, 3000 + Math.random() * 2000);
    };

    const startWave = () => {
      if (waving) return;
      waving = true;
      waveFrame = 0;
      paint();
      if (reduced) return;
      waveTimer = window.setInterval(() => {
        waveFrame += 1;
        if (!hidden) paint();
      }, 230);
    };

    const stopWave = () => {
      if (!waving) return;
      waving = false;
      window.clearInterval(waveTimer);
      waveTimer = 0;
      paint();
    };

    const onVisibility = () => {
      hidden = document.hidden;
      if (!hidden) paint();
    };

    host.addEventListener('pointerenter', startWave);
    host.addEventListener('pointerleave', stopWave);
    host.addEventListener('focusin', startWave);
    host.addEventListener('focusout', stopWave);
    document.addEventListener('visibilitychange', onVisibility);

    paint();
    scheduleBlink();

    return () => {
      host.removeEventListener('pointerenter', startWave);
      host.removeEventListener('pointerleave', stopWave);
      host.removeEventListener('focusin', startWave);
      host.removeEventListener('focusout', stopWave);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearTimeout(blinkTimer);
      window.clearTimeout(blinkOffTimer);
      window.clearInterval(waveTimer);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      width={RUNNER_IDLE[0].length}
      height={RUNNER_IDLE.length}
      className="hv-nav-sprite"
      aria-hidden="true"
    />
  );
}
