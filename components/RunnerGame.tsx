'use client';

import { useEffect, useRef } from 'react';
import { BUG, FLAME, RUNNER, drawPixelText, pixelTextWidth, spriteCanvas } from '@/lib/pixel';

// World units are sprite pixels; `scale` CSS pixels per unit.
const WORLD_H = 48;
const GROUND = 44;
const GRAVITY = 620; // units/s^2
const JUMP = 186; // units/s, ~28 units high, ~0.6s airtime
const PLAYER_X = 14;
const HI_KEY = 'bl-runner-hi';
const JET_RISE = 55;
const JET_CEILING = 26;
const STAR_COLOURS = ['#9b59b6', '#84cdfa', '#5ad1cd', '#ffffff'];

type Mode = 'attract' | 'playing' | 'over';
type Bug = { x: number; frame: number };

const pad = (n: number) => String(n).padStart(5, '0');

// Chrome-dino style runner. Idles in "attract" mode (auto-jumps), Space / tap /
// gamepad button 0 takes over. Pauses off-screen and while the tab is hidden;
// with reduced motion it draws one still frame until the player starts it.
export default function RunnerGame({
  scale = 2,
  className,
}: {
  scale?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sprites = {
      runA: spriteCanvas(RUNNER.runA),
      runB: spriteCanvas(RUNNER.runB),
      jump: spriteCanvas(RUNNER.jump),
      bug: BUG.map((frame) => spriteCanvas(frame)),
      flame: FLAME.map((frame) => spriteCanvas(frame)),
    };

    let width = 200;
    let mode: Mode = 'attract';
    let py = 0; // height above ground
    let vy = 0;
    let speed = 110;
    let distance = 0;
    let score = 0;
    let hi = 0;
    let bugs: Bug[] = [];
    let gap = 120;
    let animT = 0;
    let overAt = 0;
    let stars: { x: number; y: number; c: string }[] = [];
    let raf = 0;
    let last = 0;
    let visible = true;
    let padHeld = false;
    let jetpack = false;
    let holding = false;

    try {
      hi = Number(localStorage.getItem(HI_KEY)) || 0;
    } catch {}

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      width = Math.max(80, cssW / scale);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(WORLD_H * scale * dpr);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      ctx.imageSmoothingEnabled = false;
      stars = Array.from({ length: Math.round(width / 18) }, (_, i) => ({
        x: (i * 37) % Math.floor(width),
        y: 3 + ((i * 13) % 24),
        c: STAR_COLOURS[i % STAR_COLOURS.length],
      }));
      draw();
    };

    const reset = () => {
      py = 0;
      vy = 0;
      speed = 110;
      distance = 0;
      score = 0;
      bugs = [];
      gap = 120;
    };

    const announce = (text: string) => {
      if (liveRef.current) liveRef.current.textContent = text;
    };

    const action = () => {
      if (mode === 'attract') {
        reset();
        mode = 'playing';
        announce('Game started. Press Space or tap to jump.');
        start();
      } else if (mode === 'playing') {
        if (py === 0) vy = JUMP;
      } else if (performance.now() - overAt > 400) {
        reset();
        mode = 'playing';
        announce('Game restarted.');
        start();
      }
    };

    const step = (dt: number) => {
      animT += dt;
      if (mode === 'playing') speed = Math.min(230, speed + 4 * dt);
      const move = speed * dt;
      distance += move;
      if (mode === 'playing') score = Math.floor(distance / 10);

      for (const star of stars) {
        star.x -= move * 0.15;
        if (star.x < 0) star.x += width;
      }

      for (const bug of bugs) bug.x -= move;
      bugs = bugs.filter((bug) => bug.x > -12);
      const lastBug = bugs[bugs.length - 1];
      if (!lastBug || lastBug.x < width - gap) {
        bugs.push({ x: width + 4, frame: Math.random() });
        if (mode === 'playing' && speed > 150 && Math.random() < 0.25) {
          bugs.push({ x: width + 15, frame: Math.random() });
        }
        gap = 70 + Math.random() * 90 + speed * 0.3;
      }

      // attract mode plays itself
      if (mode === 'attract' && py === 0) {
        const ahead = bugs.find((bug) => bug.x + 10 > PLAYER_X);
        if (ahead && ahead.x - (PLAYER_X + 12) < speed * 0.22) vy = JUMP;
      }

      if (jetpack && holding && mode === 'playing' && py < JET_CEILING) {
        vy = 0;
        py = Math.min(JET_CEILING, py + JET_RISE * dt);
      } else if (vy !== 0 || py > 0) {
        py += vy * dt;
        vy -= GRAVITY * dt;
        if (py <= 0) {
          py = 0;
          vy = 0;
        }
      }

      if (mode === 'playing') {
        const top = GROUND - 16 - py + 2;
        const bottom = GROUND - py;
        const hit = bugs.some(
          (bug) => bug.x + 1 < PLAYER_X + 9 && bug.x + 9 > PLAYER_X + 3 && bottom > GROUND - 7 && top < GROUND
        );
        if (hit) {
          mode = 'over';
          overAt = performance.now();
          if (score > hi) {
            hi = score;
            try {
              localStorage.setItem(HI_KEY, String(hi));
            } catch {}
          }
          announce(`Game over. Score ${score}. High score ${hi}. Press Space or tap to retry.`);
        }
      }
    };

    const draw = () => {
      // clear the whole backing store: the world width is fractional, so clearing
      // only world units would leave a stale strip at the right edge
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      ctx.globalAlpha = 0.55;
      for (const star of stars) {
        ctx.fillStyle = star.c;
        ctx.fillRect(Math.round(star.x), star.y, 1, 1);
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(0, GROUND, width, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      const offset = distance % 18;
      for (let x = -offset; x < width; x += 18) ctx.fillRect(Math.round(x), GROUND + 2, 3, 1);

      for (const bug of bugs) {
        const frame = sprites.bug[Math.floor(animT * 8 + bug.frame * 2) % 2];
        ctx.drawImage(frame, Math.round(bug.x), GROUND - 8);
      }

      if (jetpack && holding && mode === 'playing' && py > 1) {
        const flame = sprites.flame[Math.floor(animT * 12) % 2];
        ctx.drawImage(flame, PLAYER_X - 3, Math.round(GROUND - 16 - py) + 8);
      }

      const runner =
        py > 0
          ? sprites.jump
          : mode === 'over' || (reduced && mode === 'attract')
            ? sprites.runB
            : Math.floor(animT * speed / 14) % 2
              ? sprites.runA
              : sprites.runB;
      ctx.drawImage(runner, PLAYER_X, Math.round(GROUND - 16 - py));

      const dim = 'rgba(255,255,255,0.55)';
      if (mode === 'attract') {
        const blink = reduced || Math.floor(animT * 2) % 2 === 0;
        const text = 'SPACE / TAP TO PLAY';
        if (blink) drawPixelText(ctx, text, width - pixelTextWidth(text) - 2, 2, dim);
      } else {
        const hud = `HI ${pad(hi)}  ${pad(score)}`;
        drawPixelText(ctx, hud, width - pixelTextWidth(hud) - 2, 2, dim);
      }
      if (mode === 'over') {
        const text = 'GAME OVER - TAP TO RETRY';
        drawPixelText(ctx, text, Math.round((width - pixelTextWidth(text)) / 2), 16, '#ffffff');
      }
    };

    const pollPad = () => {
      const pads = navigator.getGamepads?.() ?? [];
      const pressed = Array.from(pads).some((pad) => pad?.buttons[0]?.pressed);
      if (pressed && !padHeld) action();
      padHeld = pressed;
    };

    const frame = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      pollPad();
      if (mode !== 'over') step(dt);
      else animT += dt;
      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    };

    function start() {
      if (raf || !visible || document.hidden) return;
      if (reduced && mode === 'attract') return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        event.preventDefault();
        holding = true;
        action();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') holding = false;
    };
    // no preventDefault: a touch that starts on the canvas must still scroll the page
    const onPointer = () => {
      // focusVisible: false keeps the keyboard focus ring off for mouse and touch starts
      canvas.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
      holding = true;
      action();
    };
    const onPointerUp = () => {
      holding = false;
    };
    const onBlur = () => {
      holding = false;
    };
    const onKonami = (event: Event) => {
      jetpack = (event as CustomEvent<{ enabled?: boolean }>).detail?.enabled === true;
      if (!jetpack) holding = false;
    };
    const onVisibility = () => {
      if (!document.hidden) start();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
    });
    const resizeObserver = new ResizeObserver(resize);

    canvas.addEventListener('keydown', onKey);
    canvas.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointerdown', onPointer);
    canvas.addEventListener('blur', onBlur);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('bl-konami', onKonami);
    document.addEventListener('visibilitychange', onVisibility);
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    resize();
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      canvas.removeEventListener('keydown', onKey);
      canvas.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onPointer);
      canvas.removeEventListener('blur', onBlur);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('bl-konami', onKonami);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [scale]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="Pixel runner mini-game. Press Space or tap to jump over the bugs."
        className="hv-runner-canvas"
        style={{ height: WORLD_H * scale }}
      />
      <span ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  );
}
